import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function useScrollPanel({ contentRef, contentHeight, panelHeight, padding, scrollOffsetRef, contentOffsetRef, viewportHeight }) {
  const scrollState = useRef(0);

  useFrame(() => {
    if (!contentRef.current) return;
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    const clamped = Math.max(0, Math.min(maxScroll, scrollOffsetRef.current));
    scrollState.current = clamped;
    scrollOffsetRef.current = clamped;
    const startY = panelHeight / 2 - padding;
    contentRef.current.position.y = (contentOffsetRef?.current || 0) + startY + clamped;
  });

  return { scrollState };
}
