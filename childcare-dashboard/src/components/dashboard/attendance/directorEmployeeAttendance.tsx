"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

type Status = "present" | "absent" | "no-record";

interface DailyRecord {
  employee: {
    _id: string;
    fullName: string;
    role: string;
  };
  status: Status;
  checkIn: string | null;
}

interface MonthlyRecord {
  employee: {
    _id: string;
    fullName: string;
    role: string;
  };
  month: {
    [day: number]: Status;
  };
}

export default function DirectorAttendancePage() {
  const [view, setView] = useState<"daily" | "monthly">("daily");

  const [dailyData, setDailyData] = useState<DailyRecord[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRecord[]>([]);
  const [daysInMonth, setDaysInMonth] = useState(30);

  const [roleFilter, setRoleFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];
  const weekdayName = new Date().toLocaleDateString("ar-SA", { weekday: "long" });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // ⭐ ترجمة الدور
  const translateRole = (role: string) => {
    const map: Record<string, string> = {
      teacher: "معلمة",
      assistant_teacher: "مساعدة معلمة",
      director: "مديرة",
      assistant_director: "مساعدة مديرة",
    };
    return map[role] || role;
  };

  // ⭐ حالة التحضير
  const renderStatus = (status: Status) => {
    const colors: Record<Status, string> = {
      present: "text-green-600",
      absent: "text-red-600",
      "no-record": "text-gray-500",
    };

    const symbols: Record<Status, string> = {
      present: "✔",
      absent: "✖",
      "no-record": "—",
    };

    return <span className={`text-lg font-bold ${colors[status]}`}>{symbols[status]}</span>;
  };

  // ---------------- DAILY ----------------
  const fetchDaily = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/director/attendance/daily?date=${today}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let records = res.data.records || [];

      // ⭐ فلترة حسب الدور
      if (roleFilter !== "all") {
        records = records.filter((item: DailyRecord) => item.employee.role === roleFilter);
      }

      setDailyData(records);
    } catch (err) {
      console.log("Daily fetch error:", err);
    }
  };

  // ---------------- MONTHLY ----------------
  const fetchMonthly = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/director/attendance/monthly?month=${currentMonth}&year=${currentYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let records = res.data.records || [];

      if (roleFilter !== "all") {
        records = records.filter((item: MonthlyRecord) => item.employee.role === roleFilter);
      }

      setMonthlyData(records);
      setDaysInMonth(res.data.daysInMonth || 30);
    } catch (err) {
      console.log("Monthly fetch error:", err);
    }
  };

  // أول تحميل
  useEffect(() => {
    fetchDaily();
    fetchMonthly();
  }, []);

  // عند تغيير الفلتر
  useEffect(() => {
    fetchDaily();
    fetchMonthly();
  }, [roleFilter]);

  return (
    <div className="w-full sm:max-w-full md:max-w-[725px] lg:max-w-[850px] mx-auto bg-[var(--bg)] my-2">
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-[24px] font-bold text-[var(--text)]">تحضير الموظفات</h2>
      </div>

      {/* التاريخ + الأزرار + الفلتر جنب بعض */}
      <div className="max-w-5xl mx-auto mt-4 flex justify-between items-center gap-4">
        <div className="text-[var(--text)] font-semibold text-lg text-right">
          📅 {today} — {weekdayName}
        </div>

        <div className="flex items-center gap-3">
          {/* الأزرار (ديسكتوب فقط) */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => setView("daily")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                view === "daily" ? "bg-[#F9B236] text-white" : "bg-[var(--card)] text-[var(--text)] shadow-sm"
              }`}
            >
              الحضور اليومي
            </button>

            <button
              onClick={() => setView("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                view === "monthly"
                  ? "bg-[#F9B236] text-white"
                  : "bg-[var(--card)] text-[var(--text)] shadow-sm"
              }`}
            >
              الحضور الشهري
            </button>
          </div>

          {/* ROLE FILTER */}
          <select
            className="shadow-sm border border-[var(--border)] px-3 py-2 rounded-md bg-[var(--card)] text-[var(--text)]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">كل الموظفات</option>
            <option value="teacher">معلمة</option>
            <option value="assistant_teacher">معلمة مساعدة</option>
            <option value="assistant_director">مدير مساعد</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full px-0 mt-4">
        <div className="bg-[var(--card)] shadow-sm rounded-2xl w-full overflow-x-auto max-w-full sm:max-w-full md:max-w-[725px] lg:max-w-full mx-auto">
          {/* DAILY */}
          {(view === "daily" || (typeof window !== "undefined" && window.innerWidth < 768)) && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[rgba(249,178,54,0.15)] text-[var(--text)]">
                  <th className="p-3 border-l border-[var(--border)]">الاسم</th>
                  <th className="p-3 border-l border-[var(--border)]">الوظيفة</th>
                  <th className="p-3 border-l border-[var(--border)]">الحالة</th>
                  <th className="p-3 border-l border-[var(--border)]">وقت الحضور</th>
                </tr>
              </thead>

              <tbody>
                {dailyData.map((emp, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border)] transition text-[var(--text)]"
                  >
                    <td className="p-3 border-l border-[var(--border)]">
                      {emp.employee.fullName}
                    </td>
                    <td className="p-3 border-l border-[var(--border)]">
                      {translateRole(emp.employee.role)}
                    </td>
                    <td className="p-3 border-l border-[var(--border)]">
                      {renderStatus(emp.status)}
                    </td>
                    <td className="p-3 border-l border-[var(--border)]">
                      {emp.checkIn
                        ? new Date(emp.checkIn).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* MONTHLY */}
          {view === "monthly" && (
            <div className="hidden md:block">
              <table className="border-collapse min-w-max w-max text-right mx-0">
                <thead>
                  <tr className="bg-[rgba(249,178,54,0.15)] text-[var(--text)]">
                    <th className="p-3 border-l border-[var(--border)]">الاسم</th>
                    <th className="p-3 border-l border-[var(--border)]">الوظيفة</th>

                    {[...Array(daysInMonth)].map((_, i) => (
                      <th key={i} className="px-2 py-1 text-sm">
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {monthlyData.map((emp, i) => (
                    <tr key={i} className="border-b border-[var(--border)] transition text-[var(--text)]">
                      <td className="p-3 border-l border-[var(--border)] font-medium">{emp.employee.fullName}</td>
                      <td className="p-3 border-l border-[var(--border)]">{translateRole(emp.employee.role)}</td>

                      {[...Array(daysInMonth)].map((_, dayIndex) => {
                        const d = dayIndex + 1;
                        const status = emp.month[d] || "no-record";
                        return (
                          <td key={d} className="px-2 py-1 text-center">
                            {renderStatus(status as Status)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
