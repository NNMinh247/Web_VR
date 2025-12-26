import React from "react";
import { useGLTF } from "@react-three/drei";

export default function ModelViewer({ modelUrl }) {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={0.8} position={[0, 0, 0]} />;
}