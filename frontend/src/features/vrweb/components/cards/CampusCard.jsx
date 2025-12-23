import React, { Suspense } from "react";
import { Text } from "@react-three/drei";
import { VRImagePlane } from "../../primitives/MediaPlanes.jsx";

export default function CampusCard({ card, cardW, cardH, imgH, registerTarget }) {
  return (
    <group>
      <mesh
        position={[0, 0, -0.005]}
        ref={(m) => {
          if (!m) return;
          m.userData.__campusIdx = card.targetIndex;
          registerTarget?.(m);
        }}
      >
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, -0.006]}>
        <planeGeometry args={[cardW + 0.02, cardH + 0.02]} />
        <meshBasicMaterial color="#e5eaf0" />
      </mesh>

      <Suspense fallback={null}>
        <VRImagePlane url={card.thumb} width={cardW - 0.08} height={imgH} position={[0, cardH / 2 - imgH / 2 - 0.06, 0.02]} />
      </Suspense>

      <Text position={[0, -cardH / 2 + 0.05, 0.02]} fontSize={0.032} color="#2b2b44" anchorX="center" anchorY="middle" maxWidth={cardW - 0.1}>
        {card.title}
      </Text>
    </group>
  );
}
