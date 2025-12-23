import React, { Suspense } from "react";
import { Text } from "@react-three/drei";
import { VRImagePlane } from "../../primitives/MediaPlanes.jsx";

export default function AchievementCard({ achievement, cardW, cardH, imgH, imageUrl, numberText }) {
  const desc = achievement?.description ? String(achievement.description) : "";
  const padTop = 0.03;
  const imageY = cardH / 2 - padTop - imgH / 2;
  const numberY = imageY - imgH / 2 - 0.07;
  const descY = numberY - 0.08;

  return (
    <group>
      <mesh position={[0, 0, -0.007]}>
        <planeGeometry args={[cardW + 0.016, cardH + 0.016]} />
        <meshBasicMaterial color="#e9e9e9" />
      </mesh>
      <mesh position={[0, 0, -0.006]}>
        <planeGeometry args={[cardW + 0.008, cardH + 0.008]} />
        <meshBasicMaterial color="#f7f7f7" />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <Suspense fallback={null}>
        <VRImagePlane url={imageUrl} width={cardW - 0.12} height={imgH} position={[0, imageY, 0.02]} />
      </Suspense>

      <Text position={[0, numberY, 0.02]} fontSize={0.072} color="#c90000" anchorX="center" anchorY="middle" maxWidth={cardW - 0.16}>
        {numberText}
      </Text>
      <Text position={[0, descY, 0.02]} fontSize={0.032} color="#222222" anchorX="center" anchorY="top" maxWidth={cardW - 0.16} lineHeight={1.45}>
        {desc}
      </Text>
    </group>
  );
}
