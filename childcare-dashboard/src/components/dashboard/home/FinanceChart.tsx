"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

export default function FinanceChart({ chartData }: any) {
  const [colors, setColors] = useState({
    text: "#000",
    border: "#ddd",
    card: "#fff",
  });

  // دالة لقراءة قيم CSS variables كل مرة يتغير الثيم
  const readThemeColors = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      text: styles.getPropertyValue("--text").trim(),
      border: styles.getPropertyValue("--border").trim(),
      card: styles.getPropertyValue("--card").trim(),
    };
  };

  useEffect(() => {
    // أول قراءة
    setColors(readThemeColors());

    // متابعة تغيّر الثيم (dark / light)
    const observer = new MutationObserver(() => {
      setColors(readThemeColors());
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const option = {
    backgroundColor: colors.card,

    title: {
      text: "العمليات المالية",
      right: "0",
      top: "10",
      textStyle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text, // الآن يتغير حسب الدارك
        fontFamily: "Tajawal, sans-serif",
      },
    },

    tooltip: { trigger: "axis" },

    xAxis: {
      type: "category",
      data: chartData.map((d: any) => d.label),
      axisLabel: { color: colors.text },
      axisLine: { lineStyle: { color: colors.border } },
    },

    yAxis: {
      type: "value",
      axisLabel: { color: colors.text },
      splitLine: { lineStyle: { color: colors.border + "55" } },
    },

    series: [
      {
        name: "المدفوعات",
        type: "line",
        smooth: true,
        data: chartData.map((d: any) => d.payments),
        lineStyle: { color: "#17B3DC", width: 3 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(23,179,220,0.6)" },
              { offset: 1, color: "rgba(23,179,220,0.1)" },
            ],
          },
        },
      },
      {
        name: "المصروفات",
        type: "line",
        smooth: true,
        data: chartData.map((d: any) => d.expenses),
        lineStyle: { color: "#D74C92", width: 3 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(215,76,146,0.6)" },
              { offset: 1, color: "rgba(215,76,146,0.1)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="rounded-[20px] p-6 shadow border border-[var(--border)] bg-[var(--card)]">
      <ReactECharts option={option} style={{ height: "320px" }} />

      <div className="flex justify-center gap-10 text-[18px] text-[var(--text)] font-semibold mt-[-3]">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#D74C92" }}
          ></span>
          <span> المصروفات </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#51B7E0" }}
          ></span>
          <span> المدفوعات </span>
        </div>
      </div>
    </div>
  );
}
