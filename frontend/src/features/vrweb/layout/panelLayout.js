import * as THREE from "three";
import { VR_Z_DISTANCE } from "../data/vrwebConstants";

export function buildUIAnchors(zDistance = VR_Z_DISTANCE) {
  const left = new THREE.Vector3(-0.6, 1.45, zDistance);
  const right = new THREE.Vector3(0.6, 1.45, zDistance);
  const hints = new THREE.Vector3(1.9, 1.45, zDistance + 0.6);
  const lookTarget = new THREE.Vector3(0, 1.45, 0);
  return { left, right, hints, lookTarget };
}
