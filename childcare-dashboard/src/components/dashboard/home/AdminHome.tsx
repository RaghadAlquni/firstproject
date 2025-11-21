"use client";

import { useEffect, useState } from "react";
import GenderChart from "./GenderState";
import FinanceChart from "./FinanceChart";
import ChildrenIcon from "../../../../public/icons/childrenIcon";
import TeachersIcon from "../../../../public/icons/teacher";
import StaffIcon from "../../../../public/icons/staff";
import EmployeeIcon from "../../../../public/icons/employeeIcon";
import BranchIcon from "../../../../public/icons/branch";
import AddIcon from "../../../../public/icons/addIcon";

interface DashboardStats {
  totalChildren: number;
  totalTeachers: number;
  totalAdmins: number;
  totalEmployees: number;
  totalBranches: number;
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

export default function AdminHome() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/dashboardState", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      setData(json);
    };

    fetchData();
  }, []);

  if (!data || !data.stats)
    return <p className="text-center text-gray-400">جاري التحميل…</p>;

  const s = data.stats;

  return (
    <div className="w-full ">

      {/* العنوان */}
      <h1 className="text-[32px] font-bold text-right my-4">
        نظرة عامة على المركز
      </h1>

      {/* ٤ كروت */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 border-[var(--border)]">
        <StatCard number={s.totalChildren} label="طفل" icon={<ChildrenIcon className="w-[32px] h-[32px]"/> } color="#F9B236" />
        <StatCard number={s.totalTeachers} label="معلمة" icon={<TeachersIcon className="w-[32px] h-[32px]"/> } color="#17B3DC" />
        <StatCard number={s.totalManager} label="إداريات" icon={<StaffIcon className="w-[32px] h-[32px]"/> } color="#F9B236"/>        
        <StatCard number={s.totalEmployees} label="موظف" icon={<EmployeeIcon className="w-[32px] h-[32px]"/> } color="#17B3DC" />
      </div>

      {/* صف: الفروع + الطلبات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        <InfoCard title={`${s.totalBranches} فرع`} desc="مجموع الفروع" icon={<BranchIcon className="w-[32px] h-[32px]"/> } color="#F9B236" />
        <InfoCard title={`${s.totalRequests} طلب تسجيل`} desc="الأطفال المضافين" icon={<AddIcon className="w-[32px] h-[32px]"/> } color="#F9B236" />
      </div>

      {/* الشارتات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        <GenderChart boys={s.genderStats.boys} girls={s.genderStats.girls} />
        <FinanceChart chartData={data.chartData} />
      </div>
    </div>
  );
}

/* الكروت */
function StatCard({ number, label, icon, color }: any) {
  return (
    <div className="bg-white rounded-[20px] border border-[var(--border)] shadow p-5 flex items-center justify-between h-[110px]">
      <div className="text-right">
        <h3 className="text-[26px] font-bold">{number} {label}</h3>
        <p className="text-gray-500 text-[14px]">
          مجموع {label === "طفل" ? "الأطفال" : label === "معلمة" ? "المعلمات" : label}
        </p>
      </div>

      <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
        style={{ background: color + "22" }}>
          {icon}
      </div>
    </div>
  );
}

function InfoCard({ title, desc, icon, color}: any) {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow border border-[var(--border)] flex items-center justify-between h-[120px]">
      <div className="text-right">
        <h2 className="text-[28px] font-bold">{title}</h2>
        <p className="text-gray-500 mt-1">{desc}</p>
      </div>
<div className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
        style={{ background: color + "22" }}>
          {icon}
      </div>
    </div>
  );
}