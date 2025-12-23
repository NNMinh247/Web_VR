import * as THREE from "three";

// Creates a visible ray with a cone tip, intended to be attached to XR controllers.
export function createLaserPointer(color) {
  const ray = new THREE.Group();
  ray.frustumCulled = false;
  ray.renderOrder = 999;

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.98,
    depthTest: false,
    depthWrite: false,
  });
  const line = new THREE.Line(geometry, material);
  line.name = "xr-ray";
  line.scale.z = 2;
  line.frustumCulled = false;
  ray.add(line);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.013, 0.08, 16),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.98,
      depthTest: false,
      depthWrite: false,
    })
  );
  tip.position.z = -2.02;
  tip.rotation.x = -Math.PI / 2;
  tip.frustumCulled = false;
  ray.add(tip);

  tintRay(ray, color);
  return ray;
}

function tintRay(ray, color) {
  ray?.traverse?.((child) => {
    if (child.material?.color) child.material.color.setHex(color);
    if (child.material) {
      child.material.opacity = 0.98;
      child.material.transparent = true;
      child.material.depthTest = false;
      child.material.depthWrite = false;
    }
  });
  ray.renderOrder = 999;
}
