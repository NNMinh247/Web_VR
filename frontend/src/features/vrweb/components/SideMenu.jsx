import React from "react";
import { Text } from "@react-three/drei";
import { PANEL_DIMENSIONS } from "../data/vrwebConstants";
import { NAV_ITEMS } from "../data/vrwebContent";

export default function SideMenu({ activeSection, setActiveSection, buildTargets }) {
  const panelW = PANEL_DIMENSIONS.nav.width;
  const panelH = PANEL_DIMENSIONS.nav.height;

  return (
    <group>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[panelW, panelH]} />
        <meshBasicMaterial color="#0f0f18" />
      </mesh>

      {NAV_ITEMS.map((item, idx) => {
        const y = panelH / 2 - 0.18 - idx * 0.18;
        const isActive = activeSection === item.key.replace("nav:", "");
        return (
          <group key={item.key} position={[0, y, 0.01]}>
            <mesh ref={(m) => buildTargets?.(m, item.key)} onClick={() => setActiveSection(item.key.replace("nav:", ""))}>
              <planeGeometry args={[panelW - 0.08, 0.14]} />
              <meshBasicMaterial color={isActive ? "#00fff0" : "#1a1a2d"} opacity={isActive ? 0.9 : 0.75} transparent />
            </mesh>
            <Text
              position={[-(panelW / 2) + 0.12, 0, 0.02]}
              fontSize={0.045}
              color={isActive ? "#0f0f18" : "#ffffff"}
              anchorX="left"
              anchorY="middle"
              maxWidth={panelW - 0.16}
            >
              {item.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
