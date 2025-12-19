"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { ResponsiveSankey } from "@nivo/sankey";
import type { PersonalTransactionRead } from "@/client/api/generated/model";

interface SankeyDiagramProps {
  transactions: PersonalTransactionRead[];
}

interface SankeyNode {
  id: string;
  label?: string;
  nodeType?: "income" | "expense" | "total";
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyNodeWithPosition {
  id: string;
  label?: string;
  nodeType?: string;
  value?: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const COLORS = {
  INCOME: "#10b981",
  INCOME_LIGHT: "#6ee7b7",
  EXPENSE: "#ef4444",
  EXPENSE_LIGHT: "#fca5a5",
  TOTAL: "#6366f1",
  TOTAL_LIGHT: "#a5b4fc",
} as const;

const CHART_CONFIG = {
  MARGIN_TOP_DESKTOP: 40,
  MARGIN_TOP_MOBILE: 30,
  MARGIN_HORIZONTAL_DESKTOP: 160,
  MARGIN_HORIZONTAL_MOBILE: 100,
  MARGIN_BOTTOM: 40,
  NODE_THICKNESS: 18,
  NODE_SPACING_DESKTOP: 24,
  NODE_SPACING_MOBILE: 20,
  LINK_OPACITY: 0.6,
  CHART_HEIGHT_DESKTOP: 1000,
  CHART_HEIGHT_MOBILE: 900,
} as const;

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

// カスタムラベルレイヤー（パーセンテージ表示付き）
const CustomLabelsLayer = ({
  nodes,
}: {
  nodes: readonly SankeyNodeWithPosition[];
}) => {
  const isMobile = useMobileDetection();

  // 合計値を計算（合計ノードの値を使用）
  const totalValue = nodes.find((node) => node.label === "合計")?.value || 0;

  return (
    <g>
      {nodes.map((node: SankeyNodeWithPosition) => {
        // 合計ノード以外にパーセンテージを表示
        if (node.nodeType !== "total" && node.value && totalValue > 0) {
          const percentage = (node.value / totalValue) * 100;
          const percentageText =
            percentage < 1 ? "<1%" : `${Math.round(percentage)}%`;

          // ノードタイプで収入・支出を判定
          const isLeft = node.nodeType === "income";
          const x = isLeft ? node.x + node.width / 2 : node.x + node.width / 2;
          const y = node.y - 8;

          return (
            <text
              key={`${node.id}-percentage`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="text-after-edge"
              fill="#1f2937"
              fontSize={isMobile ? "10px" : "13px"}
              fontWeight="700"
            >
              {percentageText}
            </text>
          );
        }
        return null;
      })}
    </g>
  );
};

export default function SankeyDiagram({ transactions }: SankeyDiagramProps) {
  const isMobile = useMobileDetection();

  const sankeyData: SankeyData = useMemo(() => {
    // 収入カテゴリ別の集計
    const incomeByCategory = new Map<string, number>();
    // 支出カテゴリ別の集計
    const expenseByCategory = new Map<string, number>();

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === "income") {
        const current = incomeByCategory.get(tx.category) || 0;
        incomeByCategory.set(tx.category, current + amount);
      } else if (tx.type === "expense") {
        const current = expenseByCategory.get(tx.category) || 0;
        expenseByCategory.set(tx.category, current + amount);
      }
    });

    // ノードとリンクを作成
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];

    // 収入を金額でソート（降順）
    const sortedIncome = Array.from(incomeByCategory.entries()).sort(
      (a, b) => b[1] - a[1],
    );

    // 支出を金額でソート（降順）
    const sortedExpense = Array.from(expenseByCategory.entries()).sort(
      (a, b) => b[1] - a[1],
    );

    // 収入ノード
    sortedIncome.forEach(([category, amount]) => {
      const nodeId = `income-${category}`;
      nodes.push({
        id: nodeId,
        label: category,
        nodeType: "income",
      });
      links.push({
        source: nodeId,
        target: "total",
        value: amount,
      });
    });

    // 合計ノード（中央）
    nodes.push({
      id: "total",
      label: "合計",
      nodeType: "total",
    });

    // 支出ノード
    sortedExpense.forEach(([category, amount]) => {
      const nodeId = `expense-${category}`;
      nodes.push({
        id: nodeId,
        label: category,
        nodeType: "expense",
      });
      links.push({
        source: "total",
        target: nodeId,
        value: amount,
      });
    });

    return { nodes, links };
  }, [transactions]);

  const getNodeColor = useCallback((node: any) => {
    const nodeType = node.nodeType;
    if (nodeType === "income") return COLORS.INCOME_LIGHT;
    if (nodeType === "expense") return COLORS.EXPENSE_LIGHT;
    if (nodeType === "total") return COLORS.TOTAL_LIGHT;
    return COLORS.TOTAL_LIGHT;
  }, []);

  if (sankeyData.nodes.length === 0 || sankeyData.links.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 text-center text-gray-600">
        データが存在しません
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
        資金の流れ（サンキーダイアグラム）
      </h3>
      <div className="text-xs text-gray-600 mb-3">
        収入から支出へのお金の流れを可視化しています
      </div>
      <div
        style={{
          height: isMobile
            ? CHART_CONFIG.CHART_HEIGHT_MOBILE
            : CHART_CONFIG.CHART_HEIGHT_DESKTOP,
        }}
      >
        <ResponsiveSankey
          data={sankeyData}
          margin={{
            top: isMobile
              ? CHART_CONFIG.MARGIN_TOP_MOBILE
              : CHART_CONFIG.MARGIN_TOP_DESKTOP,
            right: isMobile
              ? CHART_CONFIG.MARGIN_HORIZONTAL_MOBILE
              : CHART_CONFIG.MARGIN_HORIZONTAL_DESKTOP,
            bottom: CHART_CONFIG.MARGIN_BOTTOM,
            left: isMobile
              ? CHART_CONFIG.MARGIN_HORIZONTAL_MOBILE
              : CHART_CONFIG.MARGIN_HORIZONTAL_DESKTOP,
          }}
          align="justify"
          colors={getNodeColor}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={CHART_CONFIG.NODE_THICKNESS}
          nodeSpacing={
            isMobile
              ? CHART_CONFIG.NODE_SPACING_MOBILE
              : CHART_CONFIG.NODE_SPACING_DESKTOP
          }
          nodeBorderWidth={0}
          nodeBorderRadius={3}
          linkOpacity={CHART_CONFIG.LINK_OPACITY}
          linkHoverOthersOpacity={0.1}
          linkContract={3}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={isMobile ? 10 : 12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 2]],
          }}
          label={(node) => (node as any).label || (node as any).id}
          valueFormat={(value) =>
            `¥${Math.round(value as number).toLocaleString("ja-JP")}`
          }
          sort="input"
          layers={["links", "nodes", "labels", CustomLabelsLayer]}
          theme={{
            labels: {
              text: {
                fontSize: isMobile ? 10 : 13,
                fontWeight: 700,
                fill: "#1f2937",
              },
            },
            tooltip: {
              container: {
                background: "rgba(255, 255, 255, 0.95)",
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
