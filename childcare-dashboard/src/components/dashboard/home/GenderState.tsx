"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function GenderChart({ boys, girls }: any) {
  const data = [
    { name: "البنات", value: girls, color: "#D74C92" },
    { name: "الأولاد", value: boys, color: "#51B7E0" },
  ];

  return (
    <div className="rounded-[20px] p-6 shadow border border-[var(--border)] bg-[var(--card)]">
      <h2 className="text-[20px] text-[var(--text)] font-bold mb-3 items-start">
        إحصائية الأطفال حسب الجنس
      </h2>

      {/* الشارت */}
      <div className="w-full h-[180px] flex justify-center items-start mt-11 mb-0">
        
        <ResponsiveContainer width="100%" height="140%">
          <PieChart>
            <Pie
              data={data}
              innerRadius="60%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* النص تحت الشارت */}
      <div className="flex justify-center gap-10 text-[18px] text-[var(--text)] font-semibold mt-[-3]">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#D74C92" }}
          ></span>
          <span> الإناث : {girls} </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "#51B7E0" }}
          ></span>
          <span> الذكور : {boys} </span>
        </div>
      </div>
    </div>
  );
}
