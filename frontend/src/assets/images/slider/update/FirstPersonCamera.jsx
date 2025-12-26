import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const SPEED = 0.15;
const MIN_HEIGHT = 2;
const COLLISION_THRESHOLD = 1.5; 
const START_POSITION = [0, 0, 5];

export default function FirstPersonCamera({ active, playerRef }) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  
  const keys = useRef({ 
    w: false, a: false, s: false, d: false, 
    e: false, r: false, space: false 
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === " ") keys.current.space = true;
      else if (keys.current[key] !== undefined) keys.current[key] = true;
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === " ") keys.current.space = false;
      else if (keys.current[key] !== undefined) keys.current[key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const checkCollision = (position, direction) => {
    const rayOrigin = position.clone();
    rayOrigin.y = 1; 

    raycaster.current.set(rayOrigin, direction);

    const intersects = raycaster.current.intersectObjects(scene.children, true);

    const validHits = intersects.filter(
      (hit) => hit.object.type === "Mesh" && hit.object.visible
    );

    if (validHits.length > 0) {
      if (validHits[0].distance < COLLISION_THRESHOLD) {
        return true;
      }
    }
    return false;
  };

  useFrame(() => {
    if (!active) return;

    const target = playerRef?.current || camera;

    if (keys.current.space) {
      target.position.set(...START_POSITION);
      target.position.y = Math.max(target.position.y, MIN_HEIGHT);
      return;
    }

    const frontVector = new THREE.Vector3(
      0, 0, Number(keys.current.s) - Number(keys.current.w)
    );
    const sideVector = new THREE.Vector3(
      Number(keys.current.a) - Number(keys.current.d), 0, 0
    );

    const direction = new THREE.Vector3();
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation);

    if (direction.x !== 0) {

      const dirX = new THREE.Vector3(direction.x > 0 ? 1 : -1, 0, 0).applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

      if (!checkCollision(target.position, dirX)) {
         target.position.x += direction.x;
      }
    }


    if (direction.z !== 0) {

      const dirZ = new THREE.Vector3(0, 0, direction.z > 0 ? 1 : -1).applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

      if (!checkCollision(target.position, dirZ)) {
        target.position.z += direction.z;
      }
    }

    if (keys.current.e) target.position.y += SPEED;
    if (keys.current.r) target.position.y -= SPEED;

    if (target.position.y < MIN_HEIGHT) {
      target.position.y = MIN_HEIGHT;
    }
  });

  return null;
}