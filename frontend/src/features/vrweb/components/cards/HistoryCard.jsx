import React, { Suspense } from "react";
import { Text } from "@react-three/drei";
import { VRImagePlane } from "../../primitives/MediaPlanes.jsx";

export default function HistoryCard({ item, cardW, cardH, imageUrl }) {
  const year = item?.year_date ? String(item.year_date) : "";
  const title = item?.title ? String(item.title) : "";
  const desc = item?.description ? String(item.description) : "";
  const descH = (() => {
    if (!desc) return 0;
    const charsPerLine = 50;
    const lines = Math.max(1, Math.ceil(String(desc).length / charsPerLine));
    return Math.min(0.34, 0.05 + lines * 0.045);
  })();
  const imgH = imageUrl ? 0.34 : 0;

  return (
    <>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial color="#e6e6e6" transparent opacity={0.08} />
      </mesh>

      <mesh position={[-0.26 + 0.13, cardH / 2 - 0.08, 0.015]}>
        <planeGeometry args={[0.26, 0.08]} />
        <meshBasicMaterial color="#c90000" />
      </mesh>
      <Text position={[-0.26 + 0.13, cardH / 2 - 0.08, 0.02]} fontSize={0.032} color="#ffffff" anchorX="center" anchorY="middle" maxWidth={0.24}>
        {year}
      </Text>

      {(() => {
        const items = [];
        let cursor = cardH / 2 - 0.16;
        items.push(
          <Text key="title" position={[-cardW / 2 + 0.12, cursor, 0.02]} fontSize={0.037} color="#c90000" anchorX="left" anchorY="top" maxWidth={cardW - 0.24} lineHeight={1.3}>
            {title}
          </Text>
        );
        cursor -= 0.18;

        if (desc) {
          items.push(
            <Text key="desc" position={[-cardW / 2 + 0.12, cursor, 0.02]} fontSize={0.026} color="#555555" anchorX="left" anchorY="top" maxWidth={cardW - 0.24} lineHeight={1.4}>
              {desc}
            </Text>
          );
          cursor -= descH + 0.04;
        } else {
          cursor -= 0.06;
        }

        if (imageUrl) {
          items.push(
            <Suspense key="img" fallback={null}>
              <VRImagePlane url={imageUrl} width={cardW - 0.2} height={imgH} position={[0, cursor - imgH / 2, 0.02]} />
            </Suspense>
          );
          cursor -= imgH + 0.03;
        }

        return items;
      })()}
    </>
  );
}
