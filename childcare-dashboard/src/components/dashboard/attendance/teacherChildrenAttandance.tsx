"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Child {
  id: string;
  name: string;
  classroom: string | null;
  attendanceStatus: "present" | "not-checked";
}

interface Classroom {
  _id: string;
  className: string;
}

interface MonthlyRecord {
  child: { _id: string; name: string; classroom: string };
  month: { [day: number]: "present" | "absent" | "no-record" };
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loading, setLoading] = useState(false);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");

  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const isAllSelected = selectedChildren.length === children.length;

  // -------------------------------------------------------------------
  // Fetch Classrooms
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/teacherClassrooms", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) setClassrooms(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClassrooms();
  }, []);

  // -------------------------------------------------------------------
  // Fetch Daily Children
  // -------------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== "daily") return;

    const fetchChildren = async () => {
      try {
        setLoadingChildren(true);
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/dailyChildrenAttendance", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        let formatted: Child[] = [];

        if (Array.isArray(data.records)) {
          formatted = data.records.map((item: any) => ({
            id: item.child._id,
            name: item.child.childName,
            classroom: item.child.classroom,
            attendanceStatus: item.attendanceStatus,
          }));
        }

        let filtered = formatted.filter((c) => c.attendanceStatus !== "present");

        if (selectedClassroom !== "all") {
          filtered = filtered.filter((c) => c.classroom === selectedClassroom);
        }

        setChildren(filtered);
      } catch (err) {
        console.error(err);
      }

      setLoadingChildren(false);
    };

    fetchChildren();
  }, [activeTab, selectedClassroom]);

  // -------------------------------------------------------------------
  // Fetch Monthly Attendance
  // -------------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== "monthly") return;

    const fetchMonthlyAttendance = async () => {
      try {
        setLoadingMonthly(true);

        const token = localStorage.getItem("token");
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        const res = await axios.get(
          `http://localhost:5000/teacherChildrenAttendance?month=${month}&year=${year}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;

        if (Array.isArray(data.records)) {
          setMonthlyRecords(
            data.records.map((rec: any) => ({
              child: {
                _id: rec.child._id,
                name: rec.child.name || rec.child.childName,
                classroom: rec.child.classroom,
              },
              month: rec.month,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      }

      setLoadingMonthly(false);
    };

    fetchMonthlyAttendance();
  }, [activeTab]);

  // -------------------------------------------------------------------
  // Filter Monthly
  // -------------------------------------------------------------------
  const filteredMonthly =
    selectedClassroom === "all"
      ? monthlyRecords
      : monthlyRecords.filter((rec) => rec.child.classroom === selectedClassroom);

  // -------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------
  const handleSelectChild = (id: string) => {
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) setSelectedChildren([]);
    else setSelectedChildren(children.map((c) => c.id));
  };

  // -------------------------------------------------------------------
  // Submit Attendance
  // -------------------------------------------------------------------
  const handleSubmitAttendance = async () => {
    if (selectedChildren.length === 0) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/childCheckIn",
        { childIds: selectedChildren },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("تم تسجيل الحضور بنجاح ✔");

      const remaining = children.filter((c) => !selectedChildren.includes(c.id));
      setChildren(remaining);
      setSelectedChildren([]);
    } catch (error) {
      alert("حدث خطأ أثناء التحضير ❌");
    }

    setLoading(false);
  };

  return (
    <div className="w-full sm:max-w-full md:max-w-[725px] lg:max-w-[850px] mx-auto bg-[var(--bg)] my-2">

      {/* -----------------------------------------------------
        Page Header
      ----------------------------------------------------- */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-[28px] font-bold text-[var(--text)]">تحضير الأطفال</h2>
      </div>

      {/* -----------------------------------------------------
        Tabs + Classroom Filter on one row
      ----------------------------------------------------- */}
      <div className="flex justify-between items-center mb-6">

        {/* Classroom Filter */}
        <div className="flex items-center gap-3">
          <select
            className="shadow-sm border border-[var(--border)] px-3 py-2 rounded-md  bg-[var(--card)] text-[var(--text)]"
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
          >
            <option value="all">جميع الصفوف</option>

            {classrooms.map((cls) => (
              <option key={cls._id} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("daily")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "daily"
                ? "bg-[#F9B236] text-white"
                : "bg-[var(--card)] text-[var(--text)] shadow-sm"
            }`}
          >
            تحضير اليوم
          </button>

          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium hidden md:inline-flex ${
              activeTab === "monthly"
                ? "bg-[#F9B236] text-white"
                : "bg-[var(--card)] text-[var(--text)] shadow-sm"
            }`}
          >
            الحضور الشهري
          </button>
        </div>

      </div>

      {/* -----------------------------------------------------
        DAILY TABLE
      ----------------------------------------------------- */}
      {activeTab === "daily" && (
        <>
          {loadingChildren && (
            <p className="text-center text-[var(--text)] mt-10">جارِ تحميل الأطفال...</p>
          )}

          {!loadingChildren && children.length > 0 && (
            <>
              <div className="bg-[var(--card)] shadow-sm rounded-xl overflow-x-auto max-w-full mx-auto sm:max-w-full md:max-w-[725px] lg:max-w-[850px]">
            <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[rgba(249,178,54,0.15)] text-[var(--text)]">
                      <th className="p-3 border-l border-[var(--border)] text-center">
                        <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                      </th>
                      <th className="p-3 border-l border-[var(--border)]">اسم الطفل</th>
                      <th className="p-3 border-l border-[var(--border)]">الصف</th>
                    </tr>
                  </thead>

                  <tbody>
                    {children.map((child) => (
                      <tr key={child.id} className="border-b border-[var(--border)] transition text-[var(--text)]">
                        <td className="p-3 border-l border-[var(--border)] text-center">
                          <input
                            type="checkbox"
                            checked={selectedChildren.includes(child.id)}
                            onChange={() => handleSelectChild(child.id)}
                          />
                        </td>

                        <td className="p-3 border-l border-[var(--border)]">{child.name}</td>
                        <td className="p-3 border-l border-[var(--border)]">{child.classroom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  disabled={selectedChildren.length === 0 || loading}
                  onClick={handleSubmitAttendance}
                  className={`px-8 py-3 rounded-lg text-white font-semibold ${
                    selectedChildren.length > 0 && !loading
                      ? "bg-[#F9B236] text-white"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? "جاري التحضير..." : "تأكيد الحضور"}
                </button>
              </div>
            </>
          )}

          {!loadingChildren && children.length === 0 && (
            <p className="text-center text-[var(--text)] mt-10">
              تم تسجيل حضور هذا الفصل اليوم ✔
            </p>
          )}
        </>
      )}

      {/* -----------------------------------------------------
        MONTHLY TABLE — horizontal scroll + fixed height
      ----------------------------------------------------- */}
      {activeTab === "monthly" && (
        <div
          className="hidden md:block overflow-x-auto overflow-y-auto mt-6 bg-white shadow-md rounded-xl"
          style={{ maxHeight: "420px", maxWidth: "100%" }}
        >
          {loadingMonthly ? (
            <p className="text-center text-[var(--text)] mt-10">جارِ تحميل الحضور...</p>
          ) : (
            <div className="min-w-max bg-[var(--card)] ">
              <table className="text-right ">
                <thead className="bg-[rgba(249,178,54,0.15)]">
                  <tr className="bg-[rgba(249,178,54,0.15)] text-[var(--text)]">
                      <th className="p-3 border-l border-[var(--border)] text-center">الطالب</th>
                    {Array.from({ length: 31 }).map((_, i) => (
                      <th key={i} className="p-2 text-center whitespace-nowrap">
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredMonthly.map((rec) => (
                    <tr key={rec.child._id} className="border-b border-[var(--border)] text-[var(--text)]">
                      <td className="p-3 border-l border-[var(--border)] whitespace-nowrap">{rec.child.name}</td>

                      {Object.values(rec.month).map((status, i) => (
                        <td
                          key={i}
                          className={`p-2 text-center whitespace-nowrap ${
                            status === "present"
                              ? "text-green-600"
                              : status === "absent"
                              ? "text-red-500"
                              : "text-gray-300"
                          }`}
                        >
                          {status === "present"
                            ? "✔"
                            : status === "absent"
                            ? "✘"
                            : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
