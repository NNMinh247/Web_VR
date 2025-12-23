import React, { Suspense } from "react";
import { Text } from "@react-three/drei";
import { VRLogoPlaneAutoFit } from "../../primitives/MediaPlanes.jsx";

export default function PartnerCard({ partner, cellW, cellH, logoUrl }) {
  const name = partner?.name ? String(partner.name) : "";

  return (
    <group>
      <mesh position={[0, 0, -0.004]}>
        <planeGeometry args={[cellW, cellH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[cellW + 0.02, cellH + 0.02]} />
        <meshBasicMaterial color="#e7eef7" />
      </mesh>
      {logoUrl ? (
        <Suspense fallback={null}>
          <VRLogoPlaneAutoFit url={logoUrl} maxWidth={cellW - 0.1} maxHeight={cellH - 0.08} position={[0, 0, 0.02]} />
        </Suspense>
      ) : (
        <Text fontSize={0.024} color="#18324f" anchorX="center" anchorY="middle" maxWidth={cellW - 0.08}>
          {name}
        </Text>
      )}
    </group>
  );
}
