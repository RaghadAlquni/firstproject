"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface DailyRecord {
  child: { _id: string; name: string };
  teacher: string;
  status: "present" | "absent" | "no-record";
  checkIn: string | null;
}

interface MonthlyRecord {
  child: { _id: string; name: string };
  teacher: string;
  month: { [day: number]: string };
}

interface Teacher {
  _id: string;
  fullName: string;
}

export default function DirectorChildrenAttendancePage() {
  const [view, setView] = useState<"daily" | "monthly">("daily");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  const [dailyData, setDailyData] = useState<DailyRecord[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRecord[]>([]);
  const [daysInMonth, setDaysInMonth] = useState(30);

  const today = new Date().toISOString().split("T")[0];
  const weekdayName = new Date().toLocaleDateString("ar-SA", { weekday: "long" });

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  // ---------------- Fetch Teachers ----------------
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/managedTeachers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.teachers)
        ? res.data.teachers
        : [];

      setTeachers(data);
    } catch (err) {
      console.log("Teacher fetch error:", err);
      setTeachers([]);
    }
  };

  // ---------------- DAILY ----------------
  const fetchDaily = async () => {
    try {
      const token = localStorage.getItem("token");

      const url =
        selectedTeacher === "all"
          ? `http://localhost:5000/director/children-attendance/daily?date=${today}`
          : `http://localhost:5000/director/children-attendance/daily?date=${today}&teacherId=${selectedTeacher}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data.records) ? res.data.records : [];
      setDailyData(data);
    } catch (err) {
      console.log("Daily fetch error:", err);
      setDailyData([]);
    }
  };

  // ---------------- MONTHLY ----------------
  const fetchMonthly = async () => {
    try {
      const token = localStorage.getItem("token");

      const url =
        selectedTeacher === "all"
          ? `http://localhost:5000/director/children-attendance/monthly?month=${month}&year=${year}`
          : `http://localhost:5000/director/children-attendance/monthly?month=${month}&year=${year}&teacherId=${selectedTeacher}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data.records) ? res.data.records : [];

      setMonthlyData(data);
      setDaysInMonth(res.data.daysInMonth || 30);
    } catch (err) {
      console.log("Monthly fetch error:", err);
      setMonthlyData([]);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchTeachers();
    fetchDaily();
    fetchMonthly();
  }, []);

  // On teacher filter change
  useEffect(() => {
    fetchDaily();
    fetchMonthly();
  }, [selectedTeacher]);

  const renderStatus = (status: string) => {
    const colors: any = {
      present: "text-green-600",
      absent: "text-red-600",
      "no-record": "text-gray-500",
    };
    const symbols: any = {
      present: "✔",
      absent: "✖",
      "no-record": "—",
    };

    return <span className={`text-lg font-bold ${colors[status]}`}>{symbols[status]}</span>;
  };

  return (
    <div className="w-full sm:max-w-full md:max-w-[725px] lg:max-w-[850px] mx-auto bg-[var(--bg)] my-2">

      {/* HEADER */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-[24px] font-bold text-[var(--text)]">تحضير الأطفال</h2>
      </div>

      {/* date + buttons + teacher filter */}
      <div className="max-w-5xl mx-auto mt-4 flex justify-between items-center gap-4">
        <div className="text-[var(--text)] font-semibold text-lg text-right">
          📅 {today} — {weekdayName}
        </div>

        <div className="flex items-center gap-3">
          {/* Buttons */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => setView("daily")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                view === "daily" ? "bg-[#F9B236] text-white" : "bg-[var(--card)] text-[var(--text)] shadow-sm"
              }`}
            >
              اليومي
            </button>

            <button
              onClick={() => setView("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                view === "monthly" ? "bg-[#F9B236] text-white" : "bg-[var(--card)] text-[var(--text)] shadow-sm"
              }`}
            >
              الشهري
            </button>
          </div>

          {/* Teacher filter */}
          <select
            className="shadow-sm border border-[var(--border)] px-3 py-2 rounded-md bg-[var(--card)] text-[var(--text)]"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="all">كل المعلمات</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full px-0 mt-4">
        <div className="bg-[var(--card)] shadow-sm rounded-2xl w-full overflow-x-auto">

          {/* --- DAILY TABLE --- */}
          {(view === "daily" ||
            (typeof window !== "undefined" && window.innerWidth < 768)) && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[rgba(249,178,54,0.15)] text-[var(--text)]">
                  <th className="p-3 border-l border-[var(--border)] text-center">الطفل</th>
                  <th className="p-3 border-l border-[var(--border)] text-center">المعلمة</th>    
                  <th className="p-3 border-l border-[var(--border)] text-center">الحالة</th>
                  <th className="p-3">وقت الحضور</th>
                </tr>
              </thead>

              <tbody>
                {dailyData.map((rec, i) => (
                  <tr key={i} className="border-b border-[var(--border)] transition text-[var(--text)]">
                    <td className="p-3 border-l border-[var(--border)] text-center">{rec.child.name}</td>
                    <td className="p-3 border-l border-[var(--border)] text-center">{rec.teacher}</td>
                    <td className="p-3 border-l border-[var(--border)] text-center">{renderStatus(rec.status)}</td>
                    <td className="p-3">
                      {rec.checkIn
                        ? new Date(rec.checkIn).toLocaleTimeString("en-US", {
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

          {/* --- MONTHLY TABLE --- */}
          {view === "monthly" && (
            <div className="hidden md:block">
              <table className="border-collapse min-w-max w-max text-right">
                <thead>
                  <tr className="bg-[rgba(249,178,54,0.15)] text-[var(--text)]">
                    <th className="p-3 border-l border-[var(--border)] text-center">الطفل</th>
                    <th className="p-3 border-l border-[var(--border)] text-center">المعلمة</th>

                    {[...Array(daysInMonth)].map((_, i) => (
                      <th key={i} className="px-2 py-1 text-sm">
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {monthlyData.map((rec, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 border-l border-[var(--border)] text-[var(--text)] text-center font-medium">{rec.child.name}</td>
                      <td className="p-3 border-l border-[var(--border)] text-[var(--text)] text-center">{rec.teacher}</td>

                      {[...Array(daysInMonth)].map((_, dayIndex) => {
                        const day = dayIndex + 1;
                        const status = rec.month[day] || "no-record";
                        return (
                          <td key={day} className="px-2 py-1 text-center">
                            {renderStatus(status)}
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
