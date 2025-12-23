import React from "react";
import { MeshBasicMaterial, PlaneGeometry } from "three";
import { extend } from "@react-three/fiber";

extend({ PlaneGeometry, MeshBasicMaterial });

export default function PanelFrame({ size = [1, 1], color = "#0d0d16", opacity = 1, position = [0, 0, -0.02] }) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}
