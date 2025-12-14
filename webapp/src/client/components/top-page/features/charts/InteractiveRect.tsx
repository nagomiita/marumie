"use client";
import "client-only";

import type React from "react";

interface InteractiveRectProps {
  id: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  value?: number;
  onMouseEnter: (
    event: React.MouseEvent,
    nodeData: { id: string; label?: string; value?: number },
  ) => void;
  onMouseLeave: () => void;
  onMouseMove: (event: React.MouseEvent) => void;
}

export default function InteractiveRect({
  id,
  label,
  x,
  y,
  width,
  height,
  fill,
  value,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
}: InteractiveRectProps) {
  // NaNチェック - 無効な値の場合はレンダリングしない
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    console.error("Invalid rect values:", { id, x, y, width, height });
    return null;
  }

  // 負の値やゼロの高さ/幅もスキップ
  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: SVG rect element needs mouse events for chart tooltip functionality */
    <rect
      key={id}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      opacity={1}
      aria-label={`${label || id}: ¥${Math.round(value || 0).toLocaleString("ja-JP")}`}
      onMouseEnter={(e) => onMouseEnter(e, { id, label, value })}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      style={{ cursor: "pointer" }}
    />
  );
}
