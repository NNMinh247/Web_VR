import React, { Suspense, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import SliderFallbackImg from "../../../assets/images/slider/slider1.jpg";
import { mergeHistoryWithFallback } from "../data/vrwebContent";
import { PANEL_DIMENSIONS } from "../data/vrwebConstants";
import { computeHistoryLayout } from "../layout/historyLayout";
import { buildCampusCards } from "../layout/campusLayout";
import useScrollPanel from "../hooks/useScrollPanel";
import { VRImagePlane } from "../primitives/MediaPlanes.jsx";
import HistoryCard from "./cards/HistoryCard.jsx";
import AchievementCard from "./cards/AchievementCard.jsx";
import PartnerCard from "./cards/PartnerCard.jsx";
import CampusCard from "./cards/CampusCard.jsx";

export default function TimelinePanel({
  activeSection,
  intro,
  history,
  achievements,
  partners,
  campuses,
  loadErrors,
  scrollOffsetRef,
  buildTargets,
  vrPublicUrl,
}) {
  const panelW = PANEL_DIMENSIONS.content.width;
  const panelH = PANEL_DIMENSIONS.content.height;
  const padding = PANEL_DIMENSIONS.content.padding;
  const viewportH = panelH - padding * 2;
  const contentRef = useRef();
  const contentOffsetRef = useRef(0);

  const introItem = Array.isArray(intro) && intro.length ? intro[0] : null;
  const introTitle = introItem?.title ? String(introItem.title) : "HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG";
  const introDesc = introItem?.description ? String(introItem.description) : "";
  const introImageUrl = introItem?.image_url ? vrPublicUrl(introItem.image_url) : SliderFallbackImg;

  const historyList = useMemo(() => mergeHistoryWithFallback(history), [history]);
  const achievementsList = useMemo(() => (Array.isArray(achievements) ? achievements : []), [achievements]);
  const partnersList = useMemo(() => (Array.isArray(partners) ? partners : []), [partners]);
  const campusCards = useMemo(() => buildCampusCards(campuses, vrPublicUrl), [campuses, vrPublicUrl]);
  const errorLines = useMemo(() => {
    const errors = loadErrors || {};
    const keys = Object.keys(errors);
    return keys.map((k) => `Lỗi ${k}: ${errors[k]}`);
  }, [loadErrors]);

  const historyLayout = useMemo(() => computeHistoryLayout(historyList), [historyList]);

  const achievementsLayout = useMemo(() => {
    const estimateDescHeight = (text) => {
      if (!text) return 0;
      const charsPerLine = 60;
      const lines = Math.max(1, Math.ceil(String(text).length / charsPerLine));
      return 0.06 + lines * 0.04;
    };

    const imgH = 0.32;
    const numH = 0.08;
    const basePadding = 0.1;

    const cardHeights = achievementsList.map((a) => {
      const descH = estimateDescHeight(a?.description || "");
      return Math.max(0.6, basePadding + imgH + numH + descH);
    });

    const gap = 0.14;
    const totalCards = cardHeights.reduce((a, b) => a + b, 0);
    const totalGap = cardHeights.length > 1 ? (cardHeights.length - 1) * gap : 0;
    const rowHeights = [];
    for (let i = 0; i < cardHeights.length; i += 2) {
      rowHeights.push(Math.max(cardHeights[i], cardHeights[i + 1] || 0));
    }
    const rowStack = rowHeights.reduce((a, b) => a + b, 0) + (rowHeights.length > 1 ? (rowHeights.length - 1) * gap : 0);

    return { cardHeights, gap, stackHeight: rowStack, imgH };
  }, [achievementsList]);

  const contentHeight = useMemo(() => {
    const historyHeaderH = 0.16;
    switch (activeSection) {
      case "intro":
        return 0.68 + (errorLines.length ? 0.12 : 0);
      case "history": {
        const stackH = historyLayout.stackHeight || 0.4;
        const err = errorLines.length ? 0.14 : 0;
        return Math.max(0.6, historyHeaderH + 0.1 + stackH + err + 0.12);
      }
      case "achievements": {
        const stackH = achievementsLayout.stackHeight || 0.8;
        return Math.max(1.0, 0.18 + stackH + (errorLines.length ? 0.12 : 0));
      }
      case "partners": {
        const rows = Math.max(1, Math.ceil(partnersList.length / 3));
        const gridH = rows * 0.2 + Math.max(0, rows - 1) * 0.16;
        const headerH = 0.32;
        const err = errorLines.length ? 0.12 : 0;
        return Math.max(0.6, headerH + gridH + 0.24 + err);
      }
      case "campus": {
        const headerH = 0.2;
        const cardsH = 0.5;
        const err = errorLines.length ? 0.12 : 0;
        return Math.max(0.7, headerH + cardsH + 0.18 + err);
      }
      default:
        return 0.6;
    }
  }, [activeSection, historyLayout, achievementsLayout, partnersList, errorLines.length]);

  useScrollPanel({
    contentRef,
    contentHeight,
    panelHeight: panelH,
    padding,
    scrollOffsetRef,
    contentOffsetRef,
    viewportHeight: viewportH,
  });

  const shouldRender = () => true;

  const renderIntro = () => {
    let y = 0.02;
    const nodes = [];

    if (errorLines.length) {
      const text = errorLines.join("\n");
      const h = 0.12;
      if (shouldRender(y, h)) {
        nodes.push(
          <Text key="err" position={[-panelW / 2 + 0.06, y, 0.02]} fontSize={0.03} color="#ff9f9f" anchorX="left" anchorY="top" maxWidth={panelW - 0.12} lineHeight={1.15}>
            {text}
          </Text>
        );
      }
      y -= h;
    }

    const titleH = 0.08;
    if (shouldRender(y, titleH)) {
      nodes.push(
        <Text key="intro-title" position={[-panelW / 2 + 0.06, y, 0.02]} fontSize={0.05} color="#ffffff" anchorX="left" anchorY="top" maxWidth={panelW - 0.12}>
          GIỚI THIỆU
        </Text>
      );
    }
    y -= 0.08;

    const imgH = 0.32;
    if (shouldRender(y - imgH / 2, imgH)) {
      nodes.push(
        <Suspense key="intro-img" fallback={null}>
          <VRImagePlane url={introImageUrl} width={panelW - 0.12} height={imgH} position={[0, y - imgH / 2, 0.01]} />
        </Suspense>
      );
    }
    y -= imgH + 0.08;

    const titleBlockH = 0.08;
    if (shouldRender(y, titleBlockH)) {
      nodes.push(
        <Text key="intro-head" position={[-panelW / 2 + 0.06, y, 0.02]} fontSize={0.038} color="#ffffff" anchorX="left" anchorY="top" maxWidth={panelW - 0.12} lineHeight={1.2}>
          {introTitle}
        </Text>
      );
    }
    y -= 0.12;

    if (introDesc) {
      const descH = 0.26;
      if (shouldRender(y, descH)) {
        nodes.push(
          <Text key="intro-desc" position={[-panelW / 2 + 0.06, y, 0.02]} fontSize={0.03} color="#cfd2ff" anchorX="left" anchorY="top" maxWidth={panelW - 0.12} lineHeight={1.25}>
            {introDesc}
          </Text>
        );
      }
      y -= descH;
    }

    return nodes;
  };

  const renderHistory = () => {
    let y = panelH / 2 - padding - 0.02;
    const nodes = [];

    if (errorLines.length) {
      const h = 0.12;
      if (shouldRender(y, h)) {
        nodes.push(
          <Text key="err" position={[-panelW / 2 + 0.06, y, 0.02]} fontSize={0.03} color="#ff9f9f" anchorX="left" anchorY="top" maxWidth={panelW - 0.12} lineHeight={1.15}>
            {errorLines.join("\n")}
          </Text>
        );
      }
      y -= h + 0.08;
    }

    const headerH = 0.16;
    nodes.push(
      <>
        <mesh key="history-title-bg" position={[0, y - 0.02, 0]}>
          <planeGeometry args={[panelW - 0.18, 0.12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Text
          key="history-title"
          position={[0, y, 0.02]}
          fontSize={0.055}
          color="#c90000"
          anchorX="center"
          anchorY="top"
          maxWidth={panelW - 0.24}
        >
          LỊCH SỬ PHÁT TRIỂN
        </Text>
      </>
    );
    y -= headerH + 0.06;

    const lineH = Math.max(0.5, historyLayout.stackHeight || 0.5);
    const lineY = y - (lineH / 2 - 0.01);
    nodes.push(
      <mesh key="timeline-line" position={[0, lineY, -0.01]}>
        <planeGeometry args={[0.012, lineH]} />
        <meshBasicMaterial color="#e0e0e0" />
      </mesh>
    );

    const cardW = 0.68;
    const cardHeights = historyLayout.cardHeights.length ? historyLayout.cardHeights : historyList.map(() => 0.62);
    const gap = Math.max(0.16, historyLayout.gap - 0.06);
    const startY = y;

    historyList.forEach((entry, idx) => {
      const isLeft = idx % 2 === 0;
      const cardH = cardHeights[idx] || 0.62;
      const cardY = startY - idx * (cardH + gap);
      const img = entry?.image ? vrPublicUrl(entry.image) : null;
      const x = isLeft ? -(cardW / 2 + 0.12) : cardW / 2 + 0.12;

      nodes.push(
        <group key={entry?.id || idx} position={[x, cardY - cardH / 2, 0.01]}>
          <HistoryCard item={entry} cardW={cardW} cardH={cardH} imageUrl={img} />
        </group>
      );

      const dotY = cardY - cardH / 2 + 0.04;
      nodes.push(
        <group key={`dot-${idx}`} position={[0, dotY, 0.015]}>
          <mesh>
            <circleGeometry args={[0.016, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <circleGeometry args={[0.012, 32]} />
            <meshBasicMaterial color="#c90000" />
          </mesh>
        </group>
      );
    });

    return nodes;
  };

  const renderAchievements = () => {
    let y = -0.02;
    const nodes = [];

    if (errorLines.length) {
      const h = 0.12;
      if (shouldRender(y, h)) {
        nodes.push(
          <Text key="err" position={[-panelW / 2 + 0.06, y, 0.02]} fontSize={0.03} color="#ff9f9f" anchorX="left" anchorY="top" maxWidth={panelW - 0.12} lineHeight={1.15}>
            {errorLines.join("\n")}
          </Text>
        );
      }
      y -= h;
    }

    nodes.push(
      <Text key="title" position={[0, y, 0.02]} fontSize={0.05} color="#ffffff" anchorX="center" anchorY="top" maxWidth={panelW - 0.12}>
        THÀNH TỰU NỔI BẬT
      </Text>
    );
    y -= 0.14;

    const cols = 2;
    const gapX = 0.08;
    const gapY = achievementsLayout.gap;
    const cardW = (panelW - 0.12 - (cols - 1) * gapX) / cols;
    const imgH = achievementsLayout.imgH;

    achievementsList.forEach((a, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cardH = achievementsLayout.cardHeights[idx] || 0.7;
      const rowHeight = Math.max(
        achievementsLayout.cardHeights[row * 2] || 0.7,
        achievementsLayout.cardHeights[row * 2 + 1] || 0.7
      );
      const x = -panelW / 2 + 0.06 + cardW / 2 + col * (cardW + gapX);
      const rowTopY = y - row * (rowHeight + gapY);
      const centerY = rowTopY - cardH / 2;
      if (!shouldRender(centerY, cardH)) return;

      const prefix = a?.prefix ? String(a.prefix) : "";
      const val = a?.number_val !== undefined ? String(a.number_val) : "";
      const suffix = a?.suffix ? String(a.suffix) : "";
      const img = a?.image_url ? vrPublicUrl(a.image_url) : SliderFallbackImg;
      const num = [prefix, val, suffix].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

      nodes.push(
        <group key={a?.id || idx} position={[x, centerY, 0.01]}>
          <AchievementCard achievement={a} cardW={cardW} cardH={cardH} imgH={imgH} imageUrl={img} numberText={num} />
        </group>
      );
    });

    return nodes;
  };

  const renderPartners = () => {
    let y = 0.12;
    const nodes = [];

    if (errorLines.length) {
      const h = 0.12;
      nodes.push(
        <Text key="err" position={[0, y, 0.02]} fontSize={0.03} color="#ff9f9f" anchorX="center" anchorY="top" maxWidth={panelW - 0.12} lineHeight={1.15}>
          {errorLines.join("\n")}
        </Text>
      );
      y -= h + 0.06;
    }

    nodes.push(
      <mesh key="title-bg" position={[0, y, -0.01]}>
        <planeGeometry args={[0.82, 0.16]} />
        <meshBasicMaterial color="#f8fbff" />
      </mesh>
    );

    nodes.push(
      <Text key="title" position={[0, y, 0.02]} fontSize={0.06} color="#0b2a4d" anchorX="center" anchorY="middle" maxWidth={panelW - 0.12}>
        ĐỐI TÁC DOANH NGHIỆP
      </Text>
    );
    y -= 0.16;

    const cols = 3;
    const cellW = 0.42;
    const cellH = 0.2;
    const gapX = 0.08;
    const gapY = 0.16;
    const totalRows = Math.ceil(partnersList.length / cols) || 1;
    const gridHeight = totalRows * cellH + Math.max(0, totalRows - 1) * gapY;

    partnersList.forEach((p, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = -panelW / 2 + 0.06 + cellW / 2 + col * (cellW + gapX);
      const cellY = y - row * (cellH + gapY);
      const logo = p?.logo_url ? vrPublicUrl(p.logo_url) : null;

      nodes.push(
        <group key={p?.id || idx} position={[x, cellY - cellH / 2, 0.01]}>
          <PartnerCard partner={p} cellW={cellW} cellH={cellH} logoUrl={logo} />
        </group>
      );
    });

    return nodes;
  };

  const renderCampusCTA = () => {
    let y = panelH / 2 - padding - 0.02;
    const nodes = [];

    if (shouldRender(y, 0.12)) {
      nodes.push(
        <mesh key="campus-title-bg" position={[0, y, -0.01]}>
          <planeGeometry args={[0.96, 0.16]} />
          <meshBasicMaterial color="#f8fbff" />
        </mesh>
      );
      nodes.push(
        <Text key="title" position={[0, y, 0.02]} fontSize={0.06} color="#b62c1f" anchorX="center" anchorY="middle" maxWidth={panelW - 0.12}>
          KHÁM PHÁ CƠ SỞ HỌC VIỆN
        </Text>
      );
    }
    y -= 0.14;

    y -= 0.08;

    const cols = 2;
    const gapX = 0.08;
    const cardW = (panelW - 0.12 - gapX) / cols;
    const cardH = 0.46;
    const imgH = 0.26;

    campusCards.forEach((card, idx) => {
      const col = idx % cols;
      const x = -panelW / 2 + 0.06 + cardW / 2 + col * (cardW + gapX);
      const centerY = y - cardH / 2;
      if (!shouldRender(centerY, cardH)) return;

      nodes.push(
        <group key={card.title} position={[x, centerY, 0.01]}>
          <CampusCard card={card} cardW={cardW} cardH={cardH} imgH={imgH} registerTarget={(mesh) => buildTargets?.(mesh, `campus:card:${idx}`)} />
        </group>
      );
    });

    return nodes;
  };

  const renderContent = () => {
    if (activeSection === "intro") return renderIntro();
    if (activeSection === "history") return renderHistory();
    if (activeSection === "achievements") return renderAchievements();
    if (activeSection === "partners") return renderPartners();
    if (activeSection === "campus") return renderCampusCTA();
    return [];
  };

  return (
    <group>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[panelW, panelH]} />
        <meshBasicMaterial color="#0d0d16" transparent opacity={0} />
      </mesh>

      <group ref={contentRef} position={[0, 0, 0]}>
        {renderContent()}
      </group>
    </group>
  );
}
