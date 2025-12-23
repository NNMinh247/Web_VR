import React, { useEffect, useState } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function VRImagePlane({ url, width = 1.05, height = 0.32, position = [0, 0.17, 0.01] }) {
  const texture = useTexture(url);
  useEffect(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export function VRLogoPlane({ url, size = 0.14, position = [0, 0, 0.01] }) {
  const texture = useTexture(url);
  useEffect(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  );
}

export function VRLogoPlaneAutoFit({ url, maxWidth = 0.32, maxHeight = 0.12, position = [0, 0, 0.01] }) {
  const texture = useTexture(url);
  const [size, setSize] = useState({ w: maxWidth, h: maxHeight });

  useEffect(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const img = texture.image;
    if (!img || !img.width || !img.height) return;
    const aspect = img.width / img.height;
    let w = maxWidth;
    let h = w / aspect;
    if (h > maxHeight) {
      h = maxHeight;
      w = h * aspect;
    }
    setSize({ w, h });
  }, [texture, maxWidth, maxHeight]);

  return (
    <mesh position={position}>
      <planeGeometry args={[size.w, size.h]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
    </mesh>
  );
}
