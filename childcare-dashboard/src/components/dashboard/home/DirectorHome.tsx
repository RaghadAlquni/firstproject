"use client";

import { useEffect, useState } from "react";
import GenderChart from "./GenderState";
import FinanceChart from "./FinanceChart";
import ChildrenIcon from "../../../../public/icons/childrenIcon";
import TeachersIcon from "../../../../public/icons/teacher";
import StaffIcon from "../../../../public/icons/staff";
import EmployeeIcon from "../../../../public/icons/employeeIcon";
import AddIcon from "../../../../public/icons/addIcon";

interface DashboardStats {
  totalChildren: number;
  totalTeachers: number;
  totalEmployees: number;
  totalManager: number;
  totalRequests: number;
  genderStats: {
    boys: number;
    girls: number;
  };
}

interface DashboardData {
  stats: DashboardStats;
  chartData: any[];
}

export default function DirectorHome() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/dashboardState", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.log("Error fetching:", err);
      }
    };

    fetchData();
  }, []);

  if (!data || !data.stats)
    return (
      <p className="text-center text-[var(--text)] opacity-60">
        جاري التحميل…
      </p>
    );

  const s = data.stats;

  return (
    <div className="w-full bg-[var(--bg)]">

      {/* العنوان */}
      <h1 className="text-[32px] font-bold text-right my-4 text-[var(--text)]">
        نظرة عامة على الفرع
      </h1>

      {/* ٣ كروت */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <StatCard
          number={s.totalTeachers}
          label="معلمة"
          icon={<TeachersIcon className="w-[32px] h-[32px] text-[var(--text)]" />}
          color="#17B3DC"
        />

        <StatCard
          number={s.totalManager}
          label="إداريات"
          icon={<StaffIcon className="w-[32px] h-[32px] text-[var(--text)]" />}
          color="#F9B236"
        />

        <StatCard
          number={s.totalEmployees}
          label="موظف"
          icon={<EmployeeIcon className="w-[32px] h-[32px] text-[var(--text)]" />}
          color="#17B3DC"
        />
      </div>

      {/* الطلبات + عدد الأطفال */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-4">
        <InfoCard
          title={`${s.totalChildren} طفل`}
          desc="مجموع الأطفال"
          icon={<ChildrenIcon className="w-[32px] h-[32px] text-[var(--text)]" />}
          color="#17B3DC"
        />

        <InfoCard
          title={`${s.totalRequests} طلب تسجيل`}
          desc="الأطفال المضافين بانتظار القبول"
          icon={<AddIcon className="w-[32px] h-[32px] text-[var(--text)]" />}
          color="#F9B236"
        />
      </div>

      {/* الشارتات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        
        <GenderChart boys={s.genderStats.boys} girls={s.genderStats.girls} />
        <FinanceChart chartData={data.chartData} />
      </div>
    </div>
  );
}

/* كرت واحد */
function StatCard({ number, label, icon, color }: any) {
  return (
    <div className="bg-[var(--card)] rounded-[20px] border border-[var(--border)] shadow p-5 flex items-center justify-between h-[110px]">
      <div className="text-right">
        <h3 className="text-[26px] font-bold text-[var(--text)]">
          {number} {label}
        </h3>
        <p className="text-[var(--text)] opacity-60 text-[14px]">
          مجموع {label === "طفل" ? "الأطفال" : label}
        </p>
      </div>

      <div
        className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
        style={{ background: color + "22" }}
      >
        {icon}
      </div>
    </div>
  );
}

/* كرت الطلبات */
function InfoCard({ title, desc, icon, color }: any) {
  return (
    <div className="bg-[var(--card)] rounded-[20px] p-6 shadow border border-[var(--border)] flex items-center justify-between h-[120px]">
      <div className="text-right">
        <h2 className="text-[28px] font-bold text-[var(--text)]">{title}</h2>
        <p className="text-[var(--text)] opacity-60 mt-1">{desc}</p>
      </div>

      <div
        className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
        style={{ background: color + "22" }}
      >
        {icon}
      </div>
    </div>
  );
}
