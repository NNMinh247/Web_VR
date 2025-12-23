import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createLaserPointer } from "../primitives/LaserPointer.jsx";

export default function useRaycastInteractor({ enabled, targetsRef, onSelect }) {
  const { gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const hoverRef = useRef(null);

  const controllerGrip0 = useRef();
  const controllerGrip1 = useRef();
  const controller0 = useRef();
  const controller1 = useRef();

  const intersect = (controller) => {
    const targets = targetsRef?.current || [];
    if (!controller || targets.length === 0) return null;

    raycaster.far = Infinity;
    raycaster.near = 0.01;

    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const hits = raycaster.intersectObjects(targets, true);
    return hits[0] || null;
  };

  useEffect(() => {
    if (!gl?.xr) return;

    const c0 = gl.xr.getController(0);
    const c1 = gl.xr.getController(1);
    controller0.current = c0;
    controller1.current = c1;

    const g0 = gl.xr.getControllerGrip(0);
    const g1 = gl.xr.getControllerGrip(1);
    controllerGrip0.current = g0;
    controllerGrip1.current = g1;

    scene?.add(c0);
    scene?.add(c1);
    scene?.add(g0);
    scene?.add(g1);

    const onConnected = (controller) => (e) => {
      controller.userData.handedness = e?.data?.handedness;
    };
    const onDisconnected = (controller) => () => {
      controller.userData.handedness = undefined;
    };

    const c0Connected = onConnected(c0);
    const c1Connected = onConnected(c1);
    const c0Disconnected = onDisconnected(c0);
    const c1Disconnected = onDisconnected(c1);

    c0.addEventListener("connected", c0Connected);
    c1.addEventListener("connected", c1Connected);
    c0.addEventListener("disconnected", c0Disconnected);
    c1.addEventListener("disconnected", c1Disconnected);

    const ray0 = createLaserPointer(0x00fff0);
    const ray1 = createLaserPointer(0x00fff0);
    c0.userData.rayLine = ray0;
    c1.userData.rayLine = ray1;
    c0.add(ray0);
    c1.add(ray1);

    const handleSelect = (event) => {
      if (!enabled) return;
      const controller = event.target;
      const hit = intersect(controller);
      if (hit && hit.object) {
        onSelect?.(hit.object);
      }
    };

    c0.addEventListener("select", handleSelect);
    c1.addEventListener("select", handleSelect);

    return () => {
      scene?.remove(c0);
      scene?.remove(c1);
      scene?.remove(g0);
      scene?.remove(g1);
      c0.removeEventListener("select", handleSelect);
      c1.removeEventListener("select", handleSelect);
      c0.removeEventListener("connected", c0Connected);
      c1.removeEventListener("connected", c1Connected);
      c0.removeEventListener("disconnected", c0Disconnected);
      c1.removeEventListener("disconnected", c1Disconnected);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, enabled, onSelect]);

  useFrame(() => {
    if (!enabled) return;

    const c0 = controller0.current;
    const c1 = controller1.current;
    const rightController =
      [c0, c1].find((c) => c?.userData?.handedness === "right") || c1 || c0;

    const setRayVisual = (ray, isActive) => {
      const activeColor = 0x00fff0;
      const inactiveColor = 0x4b5563;
      ray.visible = true;
      ray.renderOrder = 999;
      ray.traverse?.((child) => {
        if (child.material?.color) child.material.color.setHex(isActive ? activeColor : inactiveColor);
        if (child.material?.opacity !== undefined) child.material.opacity = isActive ? 0.98 : 0.65;
        if (child.material) {
          child.material.transparent = true;
          child.material.depthTest = false;
          child.material.depthWrite = false;
        }
        child.renderOrder = 999;
        child.frustumCulled = false;
      });
    };

    if (c0?.userData?.rayLine) {
      const active = c0 === rightController;
      setRayVisual(c0.userData.rayLine, active);
    }
    if (c1?.userData?.rayLine) {
      const active = c1 === rightController;
      setRayVisual(c1.userData.rayLine, active);
    }

    const c = rightController;
    if (!c) return;

    const hit = intersect(c);
    const hoveredObj = hit?.object || null;

    if (hoveredObj !== hoverRef.current) {
      if (hoverRef.current) {
        hoverRef.current.userData.__vrHovered = false;
      }
      if (hoveredObj) {
        hoveredObj.userData.__vrHovered = true;
      }
      hoverRef.current = hoveredObj;
    }
  });

  return { controllerGrip0, controllerGrip1 };
}
