import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Text, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";

import "./VRWeb.css";
import { apiUrl } from "../../config/api";
import { HISTORY_FALLBACK, mergeHistoryWithFallback } from "../../features/vrweb/data/vrwebContent";
import { buildUIAnchors } from "../../features/vrweb/layout/panelLayout";
import useXRControllers from "../../features/vrweb/hooks/useXRControllers";
import useRaycastInteractor from "../../features/vrweb/hooks/useRaycastInteractor";
import SideMenu from "../../features/vrweb/components/SideMenu.jsx";
import TimelinePanel from "../../features/vrweb/components/TimelinePanel.jsx";
import HintStack from "../../features/vrweb/components/HintStack.jsx";

function resolveVrApiBase() {
  try {
    const base = new URL(apiUrl(""));
    const host = window.location.hostname;
    const isLocalSite = host === "localhost" || host === "127.0.0.1";
    const isLocalApi = base.hostname === "localhost" || base.hostname === "127.0.0.1";
    if (!isLocalSite && isLocalApi) {
      return `${window.location.protocol}//${host}:5000`;
    }
    return base.origin;
  } catch {
    return apiUrl("");
  }
}

function vrApiUrl(path) {
  const base = String(resolveVrApiBase() || "").replace(/\/+$/, "");
  if (!path) return base;
  return `${base}/${String(path).replace(/^\/+/, "")}`;
}

function vrPublicUrl(filePath) {
  return vrApiUrl(`public/${String(filePath || "").replace(/^\/+/, "")}`);
}

function Loader() {
  const { progress } = useProgress();
  return (
    <group position={[0, 1.6, -1]}>
      <Text fontSize={0.06} color="#ffffff" anchorX="center" anchorY="middle">
        {`Đang tải... ${progress.toFixed(0)}%`}
      </Text>
    </group>
  );
}

function VRLocomotion({ active, speed = 3, camRef, resetToken }) {
  const { gl, camera } = useThree();
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0, 1, 0));
  const lastSnap = useRef(0);
  const baseRefSpace = useRef(null);
  const offset = useRef(new THREE.Vector3(0, 0, 0));
  const yawOffset = useRef(0);

  useEffect(() => {
    baseRefSpace.current = null;
    offset.current.set(0, 0, 0);
    yawOffset.current = 0;
  }, [resetToken]);

  const pickPadAxes = (pads, prefer) => {
    if (!pads || pads.length === 0) return null;
    const pad = prefer === "right" ? pads[1] || pads[0] : pads[0];
    if (!pad || !pad.axes) return null;
    return Array.from(pad.axes);
  };

  useFrame((_, delta) => {
    if (!active) return;
    const session = gl.xr?.getSession?.();
    if (!session) return;
    if (typeof XRRigidTransform === "undefined") return;

    const sources = Array.from(session.inputSources || []).filter((s) => s && s.gamepad);
    const left = sources.find((s) => s.handedness === "left") || sources[0];
    const rightHand = sources.find((s) => s.handedness === "right");

    const axes = left?.gamepad?.axes || [];
    let xAxis = axes[2] !== undefined ? axes[2] : axes[0] || 0;
    let yAxis = axes[3] !== undefined ? axes[3] : axes[1] || 0;

    if (xAxis === 0 && yAxis === 0) {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      const gpAxes = pickPadAxes(pads, "left");
      if (gpAxes && gpAxes.length >= 2) {
        xAxis = gpAxes[2] !== undefined ? gpAxes[2] : gpAxes[0] || 0;
        yAxis = gpAxes[3] !== undefined ? gpAxes[3] : gpAxes[1] || 0;
      }
    }

    const deadZone = 0.15;
    if (Math.abs(xAxis) < deadZone) xAxis = 0;
    if (Math.abs(yAxis) < deadZone) yAxis = 0;

    const xrCam =
      gl.xr?.getCamera?.(camRef?.current || camera)?.cameras?.[0] ||
      gl.xr?.getCamera?.(camRef?.current || camera) ||
      camRef?.current ||
      camera;

    const camQuat = xrCam.quaternion;
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(up.current, yawOffset.current);
    const headingQuat = new THREE.Quaternion().multiplyQuaternions(yawQuat, camQuat);

    forward.current.set(0, 0, -1).applyQuaternion(headingQuat);
    forward.current.y = 0;
    forward.current.normalize();
    right.current.crossVectors(up.current, forward.current).normalize().multiplyScalar(-1);

    if (xAxis !== 0 || yAxis !== 0) {
      const moveDir = new THREE.Vector3();
      moveDir.copy(forward.current).multiplyScalar(yAxis);
      moveDir.addScaledVector(right.current, -xAxis);
      const moveSpeed = speed * delta;
      offset.current.addScaledVector(moveDir, moveSpeed);
    }

    if (rightHand?.gamepad?.axes?.length) {
      const rAxes = rightHand.gamepad.axes;
      const snapX = rAxes[2] !== undefined ? rAxes[2] : rAxes[0] || 0;
      const snapThreshold = 0.6;
      const now = performance.now() / 1000;
      const cooldown = 0.35;
      if (Math.abs(snapX) >= snapThreshold && now - lastSnap.current > cooldown) {
        const angle = (snapX > 0 ? 1 : -1) * (Math.PI / 4);
        yawOffset.current += angle;
        lastSnap.current = now;
      }
    } else {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      const gpAxes = pickPadAxes(pads, "right");
      if (gpAxes && gpAxes.length) {
        const snapX = gpAxes[2] !== undefined ? gpAxes[2] : gpAxes[0] || 0;
        const snapThreshold = 0.6;
        const now = performance.now() / 1000;
        const cooldown = 0.35;
        if (Math.abs(snapX) >= snapThreshold && now - lastSnap.current > cooldown) {
          const angle = (snapX > 0 ? 1 : -1) * (Math.PI / 4);
          yawOffset.current += angle;
          lastSnap.current = now;
        }
      }
    }

    if (!baseRefSpace.current) {
      baseRefSpace.current = gl.xr.getReferenceSpace?.();
      if (!baseRefSpace.current) return;
    }

    const offsetRef = baseRefSpace.current.getOffsetReferenceSpace(
      new XRRigidTransform(
        { x: offset.current.x, y: offset.current.y, z: offset.current.z },
        { x: yawQuat.x, y: yawQuat.y, z: yawQuat.z, w: yawQuat.w }
      )
    );
    gl.xr.setReferenceSpace(offsetRef);
  });

  return null;
}

function CampusPreviewModel({ modelUrl, active, onRotateRequest }) {
  const groupRef = useRef();
  const { scene } = useGLTF(modelUrl);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.set(0, 0, 0);
  }, [modelUrl]);

  useFrame(() => {
    if (!active) return;
    if (!groupRef.current) return;

    const deltaYaw = onRotateRequest?.() || 0;
    if (deltaYaw !== 0) {
      groupRef.current.rotation.y += deltaYaw;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.22} position={[0, -0.35, 0]} />
    </group>
  );
}

function VRTourModel({ modelUrl }) {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={0.8} position={[0, -5, 0]} />;
}

export default function VRWebOverlay({ open, session, onRequestExit }) {
  const [campuses, setCampuses] = useState([]);
  const [intro, setIntro] = useState([]);
  const [history, setHistory] = useState(HISTORY_FALLBACK);
  const [achievements, setAchievements] = useState([]);
  const [partners, setPartners] = useState([]);
  const [activeSection, setActiveSection] = useState("intro");

  const [loadErrors, setLoadErrors] = useState({});

  const [state, setState] = useState("scroll");
  const [selectedCampusIndex, setSelectedCampusIndex] = useState(0);

  const overlayRef = useRef(null);
  const stateHistoryRef = useRef([]);

  useEffect(() => {
    if (!open) return;
    resolveVrApiBase();
    setLoadErrors({});

    const fetchList = async (path, setter, key) => {
      try {
        const res = await fetch(vrApiUrl(path));
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Response is not an array");
        }
        if (key === "history") {
          setter(mergeHistoryWithFallback(data));
        } else {
          setter(data);
        }
      } catch (err) {
        console.error(`VR fetch failed: ${path}`, err);
        setLoadErrors((prev) => ({
          ...prev,
          [key]: String(err?.message || err || "Unknown error"),
        }));
        if (key === "history") {
          setter(HISTORY_FALLBACK);
        } else {
          setter([]);
        }
      }
    };

    fetchList("api/campus", setCampuses, "campus");
    fetchList("api/intro", setIntro, "intro");
    fetchList("api/history", setHistory, "history");
    fetchList("api/achievements", setAchievements, "achievements");
    fetchList("api/partners", setPartners, "partners");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setState("scroll");
    setSelectedCampusIndex(0);
    setActiveSection("intro");
    stateHistoryRef.current = [];
  }, [open]);

  const transitionState = useCallback((next) => {
    setState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      if (!resolved || resolved === prev) return prev;
      stateHistoryRef.current.push(prev);
      return resolved;
    });
  }, []);

  const goBackState = useCallback(() => {
    if (stateHistoryRef.current.length === 0) return false;
    const prevState = stateHistoryRef.current.pop();
    setState(prevState);
    return true;
  }, []);

  if (!open) return null;

  const selectedCampus = campuses[selectedCampusIndex] || null;

  return (
    <div className="vr-overlay" ref={overlayRef}>
      <div className="vr-overlay__canvas">
        <Canvas
          shadows
          camera={{ position: [0, 1.6, 2], fov: 70 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl, camera }) => {
            gl.xr.enabled = true;
            if (session) {
              gl.xr.setSession(session);
            }
            gl.setClearColor(new THREE.Color("#101019"), 1);
            gl.domElement.style.touchAction = "none";
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight castShadow position={[8, 12, 8]} intensity={1.3} />
          <Environment preset="park" blur={0.6} />

          <Suspense fallback={<Loader />}>
            <VRScene
              campuses={campuses}
              intro={intro}
              history={history}
              achievements={achievements}
              partners={partners}
              loadErrors={loadErrors}
              selectedCampusIndex={selectedCampusIndex}
              setSelectedCampusIndex={setSelectedCampusIndex}
              selectedCampus={selectedCampus}
              state={state}
              setState={transitionState}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              goBack={goBackState}
              onRequestExit={onRequestExit}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

function VRScene({
  campuses,
  intro,
  history,
  achievements,
  partners,
  loadErrors,
  selectedCampusIndex,
  setSelectedCampusIndex,
  selectedCampus,
  state,
  setState: setStateWithHistory,
  activeSection,
  setActiveSection,
  goBack,
  onRequestExit,
}) {
  const { gl, camera } = useThree();
  const { getGamepadSource, readAxes, readButtonPressed } = useXRControllers();

  const uiRef = useRef();
  const uiRightRef = useRef();
  const uiHintsRef = useRef();
  const targetsRef = useRef([]);
  const camRef = useRef(camera);
  const vrResetToken = useRef(0);

  const { left: uiAnchorLeft, right: uiAnchorRight, hints: uiAnchorHints, lookTarget } = useMemo(
    () => buildUIAnchors(-2.0),
    []
  );

  useEffect(() => {
    if (!uiRef.current) return;
    uiRef.current.position.copy(uiAnchorLeft);
    uiRef.current.lookAt(lookTarget);
  }, [uiAnchorLeft, lookTarget]);

  useEffect(() => {
    if (!uiRightRef.current) return;
    uiRightRef.current.position.copy(uiAnchorRight);
    uiRightRef.current.lookAt(lookTarget);
  }, [uiAnchorRight, lookTarget]);

  useEffect(() => {
    if (!uiHintsRef.current) return;
    uiHintsRef.current.position.copy(uiAnchorHints);
    uiHintsRef.current.lookAt(lookTarget);
  }, [uiAnchorHints, lookTarget]);

  const lastBack = useRef(false);
  const lastNavStep = useRef(0);

  const scrollOffset = useRef(0);

  const selectable = useMemo(() => {
    const list = [];
    const push = (mesh, key) => {
      if (!mesh) return;
      mesh.userData.__vrKey = key;
      list.push(mesh);
    };
    return { list, push };
  }, []);

  useEffect(() => {
    targetsRef.current = selectable.list;
  }, [selectable]);

  const onRaySelect = (obj) => {
    let cur = obj;
    while (cur && !cur.userData?.__vrKey) cur = cur.parent;
    const key = cur?.userData?.__vrKey;
    if (!key) return;

    if (key === "nav:intro") setActiveSection("intro");
    if (key === "nav:history") setActiveSection("history");
    if (key === "nav:achievements") setActiveSection("achievements");
    if (key === "nav:partners") setActiveSection("partners");
    if (key === "nav:campus") setActiveSection("campus");

    if (key?.startsWith("campus:card:")) {
      const idxFromKey = Number(String(key).split(":").pop());
      const idxFromMesh = Number(cur?.userData?.__campusIdx);
      const preferred = Number.isFinite(idxFromMesh) ? idxFromMesh : idxFromKey;
      const safeIdx = Number.isFinite(preferred)
        ? Math.min(Math.max(0, preferred), Math.max(0, campuses.length - 1))
        : 0;
      setSelectedCampusIndex(safeIdx);
      setActiveSection("campus");
      setStateWithHistory("tour");
      vrResetToken.current += 1;
      return;
    }

    if (key === "campus:next") {
      setSelectedCampusIndex((i) => Math.min(campuses.length - 1, i + 1));
      return;
    }

    if (key === "campus:prev") {
      setSelectedCampusIndex((i) => Math.max(0, i - 1));
      return;
    }

    if (key === "campus:enter") {
      if (!selectedCampus) return;
      setStateWithHistory("tour");
      vrResetToken.current += 1;
      return;
    }
  };

  useRaycastInteractor({
    enabled: true,
    targetsRef,
    onSelect: onRaySelect,
  });

  useFrame((_, delta) => {
    const left = getGamepadSource("left");
    const right = getGamepadSource("right");

    const axesWithFallback = (prefer, alt) => {
      const src = getGamepadSource(prefer) || getGamepadSource(alt);
      const { x, y } = readAxes(src);
      if (src) return { x, y };
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      const pad = prefer === "left" ? pads[0] || pads[1] : pads[1] || pads[0];
      if (!pad) return { x: 0, y: 0 };
      const ax = pad.axes || [];
      const gx = ax[2] !== undefined ? ax[2] : ax[0] || 0;
      const gy = ax[3] !== undefined ? ax[3] : ax[1] || 0;
      return { x: gx, y: gy };
    };

    const bPressed = readButtonPressed(right, 1) || readButtonPressed(right, 5);
    if (bPressed && !lastBack.current) {
      if (state === "tour") {
        vrResetToken.current += 1;
      }
      const wentBack = goBack?.();
      if (!wentBack) {
        onRequestExit?.();
      }
    }
    lastBack.current = bPressed;

    if (state === "scroll") {
      const { y: ly } = axesWithFallback("left", "right");
      const { y: ry } = axesWithFallback("right", "left");
      const deadZoneNav = 0.35;
      const deadZoneScroll = 0.15;
      const now = performance.now();

      let navTriggered = false;
      if (Math.abs(ly) > deadZoneNav && now - lastNavStep.current > 250) {
        const order = ["intro", "history", "achievements", "partners", "campus"];
        const idx = order.indexOf(activeSection);
        const dir = ly > 0 ? 1 : -1;
        const next = Math.min(order.length - 1, Math.max(0, idx + dir));
        if (next !== idx) setActiveSection(order[next]);
        lastNavStep.current = now;
        scrollOffset.current = 0;
        navTriggered = true;
      }

      const useRy = Math.abs(ry) > deadZoneScroll ? ry : 0;
      const useLy = !navTriggered && useRy === 0 && Math.abs(ly) > deadZoneScroll ? ly : 0;
      const vy = useRy !== 0 ? useRy : useLy;

      if (vy !== 0) {
        const speed = 0.65;
        scrollOffset.current = Math.max(0, scrollOffset.current + vy * speed * delta);
      }
    }

  });

  const rotateRequest = () => {
    const right = getGamepadSource("right");
    const { x } = readAxes(right);
    const dead = 0.12;
    const v = Math.abs(x) < dead ? 0 : x;
    return v * 0.04;
  };

  const buildTargets = (mesh, key) => {
    if (!mesh) return;
    mesh.userData.__vrKey = key;
    selectable.list.push(mesh);
  };

  useEffect(() => {
    scrollOffset.current = 0;
  }, [state, activeSection]);

  selectable.list.length = 0;

  return (
    <>
      {state === "scroll" && (
        <>
          <group ref={uiRef} position={[uiAnchorLeft.x, uiAnchorLeft.y, uiAnchorLeft.z]} rotation={[0, 0, 0]}>
            <SideMenu activeSection={activeSection} setActiveSection={setActiveSection} buildTargets={buildTargets} />
          </group>

          <group ref={uiRightRef} position={[uiAnchorRight.x, uiAnchorRight.y, uiAnchorRight.z]} rotation={[0, 0, 0]}>
            <TimelinePanel
              activeSection={activeSection}
              intro={intro}
              history={history}
              achievements={achievements}
              partners={partners}
              campuses={campuses}
              loadErrors={loadErrors}
              scrollOffsetRef={scrollOffset}
              buildTargets={buildTargets}
              vrPublicUrl={vrPublicUrl}
            />
          </group>

          <group ref={uiHintsRef} position={[uiAnchorHints.x, uiAnchorHints.y, uiAnchorHints.z]} rotation={[0, 0, 0]}>
            <HintStack />
          </group>
        </>
      )}

      {state === "campus" && (
        <group ref={uiRightRef} position={[uiAnchorRight.x, uiAnchorRight.y, uiAnchorRight.z]} rotation={[0, 0, 0]}>
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[1.15, 0.72]} />
            <meshBasicMaterial color="#11111a" />
          </mesh>

          <Text
            position={[0, 0.28, 0.01]}
            fontSize={0.035}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.05}
          >
            Chọn cơ sở (dùng tia laser để bấm). Xoay model bằng joystick phải.
          </Text>

          <group position={[0, -0.02, 0.22]}>
            {selectedCampus ? (
              <Suspense fallback={null}>
                <CampusPreviewModel
                  modelUrl={vrPublicUrl(selectedCampus.file_name)}
                  active={true}
                  onRotateRequest={rotateRequest}
                />
              </Suspense>
            ) : (
              <Text fontSize={0.04} color="#ffffff" anchorX="center" anchorY="middle">
                Đang tải danh sách cơ sở...
              </Text>
            )}
          </group>

          <Text
            position={[0, -0.32, 0.01]}
            fontSize={0.04}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.05}
          >
            {selectedCampus ? selectedCampus.name : ""}
          </Text>

          <group>
            <mesh position={[-0.35, -0.22, 0]} ref={(m) => buildTargets(m, "campus:prev")}>
              <planeGeometry args={[0.32, 0.1]} />
              <meshBasicMaterial color="#2b2b44" />
            </mesh>
            <Text position={[-0.35, -0.22, 0.01]} fontSize={0.035} color="#ffffff" anchorX="center" anchorY="middle">
              TRƯỚC
            </Text>

            <mesh position={[0.35, -0.22, 0]} ref={(m) => buildTargets(m, "campus:next")}>
              <planeGeometry args={[0.32, 0.1]} />
              <meshBasicMaterial color="#2b2b44" />
            </mesh>
            <Text position={[0.35, -0.22, 0.01]} fontSize={0.035} color="#ffffff" anchorX="center" anchorY="middle">
              SAU
            </Text>

            <mesh position={[0, -0.22, 0]} ref={(m) => buildTargets(m, "campus:enter")}>
              <planeGeometry args={[0.38, 0.1]} />
              <meshBasicMaterial color="#006b5a" />
            </mesh>
            <Text position={[0, -0.22, 0.01]} fontSize={0.035} color="#ffffff" anchorX="center" anchorY="middle">
              THAM QUAN
            </Text>
          </group>
        </group>
      )}

      {state === "tour" && selectedCampus && (
        <>
          <Suspense fallback={<Loader />}>
            <VRTourModel modelUrl={vrPublicUrl(selectedCampus.file_name)} />
          </Suspense>
          <VRLocomotion active={true} camRef={camRef} resetToken={vrResetToken.current} />
        </>
      )}

      <XRSessionGuard onRequestExit={onRequestExit} />
    </>
  );
}

function XRSessionGuard({ onRequestExit }) {
  const { gl } = useThree();
  const last = useRef(null);

  useFrame(() => {
    const s = gl.xr?.getSession?.();
    if (s && last.current !== s) {
      last.current = s;
      s.addEventListener("end", () => onRequestExit?.());
    }
  });

  return null;
}

useGLTF.preload = useGLTF.preload || (() => {});
