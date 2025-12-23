import React from "react";
import { Text } from "@react-three/drei";
import { HINT_PANEL } from "../data/vrwebConstants";

export default function HintStack() {
  const panelW = HINT_PANEL.width;
  const panelH = HINT_PANEL.height;
  const gapY = HINT_PANEL.gapY;

  const items = [
    "Nhấn B để thoát chế độ VR",
    "Dùng Controller để điều hướng nội dung và tiêu đề.",
    "Sử dụng tia laser để chuyển tới cơ sở muốn tham quan",
  ];

  return (
    <group>
      {items.map((text, idx) => {
        const y = 0.32 - idx * (panelH + gapY);
        return (
          <group key={text} position={[0, y, 0]}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[panelW, panelH]} />
              <meshBasicMaterial color="#f2f5f9" />
            </mesh>
            <mesh position={[0, 0, -0.011]}>
              <planeGeometry args={[panelW + 0.02, panelH + 0.02]} />
              <meshBasicMaterial color="#dfe6ef" />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.04}
              color="#1c2533"
              anchorX="center"
              anchorY="middle"
              maxWidth={panelW - 0.12}
            >
              {text}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
