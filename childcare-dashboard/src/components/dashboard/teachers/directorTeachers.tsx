"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ChildrenIcon from "../../../../public/icons/childrenIcon";
import PhoneIcon from "../../../../public/icons/phone";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Teacher {
  _id: string;
  fullName: string;
  role: string;
  directorId?: { fullName: string } | null;
  phone: string;
  teacherChildren?: any[];
  avatar: string;
}

const DirectorTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState<string>("all");

  const token = useSelector((state: RootState) => state.auth.token);

  /* --------------------------------------- */
  /* جلب بيانات المعلمين التابعين للمدير */
  /* --------------------------------------- */
  useEffect(() => {
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/managedTeachers/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔥 الحل هنا:
      const data = res.data?.teachers || [];

      setTeachers(data);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching teachers:", error.response?.data || error);
      setLoading(false);
    }
  };

  fetchTeachers();
}, []);


  /* فلترة حسب نوع الرول */
  const filteredTeachers =
    roleFilter === "all"
      ? teachers
      : teachers.filter((t) => t.role === roleFilter);

  if (loading) {
    return (
      <p className="text-[var(--text)] text-center mt-10">جاري التحميل…</p>
    );
  }

  return (
    <div className="p-4 flex flex-col  gap-4">
      {/* العنوان */}
      <h1 className="text-[24px] font-bold text-right text-[var(--text)]">
        <span className="text-[#d5d5d5] text-[20px] md:font-medium">
          المعلمات /
        </span>{" "}
        المعلمات الرئيسيات والمعلمات المساعدات
      </h1>

      {/* الفلترة حسب الرول */}
      <div className="flex gap-3 justify-start">
        <button
          onClick={() => setRoleFilter("all")}
          className={`px-4 py-2 rounded-lg border border-[var(--border)] shadow-sm hover:shadow-md transition ${
            roleFilter === "all"
              ? "bg-[var(--card)] text-[var(--text)]"
              : "text-[var(--text)]"
          }`}
        >
          الجميع
        </button>

        <button
          onClick={() => setRoleFilter("teacher")}
          className={`px-4 py-2 rounded-lg border border-[var(--border)] shadow-sm hover:shadow-md transition ${
            roleFilter === "teacher"
              ? "bg-[var(--card)] text-[var(--text)]"
              : "text-[var(--text)]"
          }`}
        >
          المعلمات
        </button>

        <button
          onClick={() => setRoleFilter("assistant_teacher")}
          className={`px-4 py-2 rounded-lg border border-[var(--border)] shadow-sm hover:shadow-md transition ${
            roleFilter === "assistant_teacher"
              ? "bg-[var(--card)] text-[var(--text)]"
              : "text-[var(--text)]"
          }`}
        >
          المعلمات المساعدات
        </button>
      </div>

      {/* قائمة المعلمات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher._id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-4"
          >
            {/* Profile */}
            <div className="flex items-center flex-row">
              <img
                src={teacher.avatar}
                alt={teacher.fullName}
                className="w-16 h-16 rounded-lg object-cover ml-4"
              />

              <div className="flex flex-col text-right gap-1">
                <h2 className="text-lg font-bold text-[var(--text)]">
                  {teacher.fullName}
                </h2>

                <p className="text-[var(--text)] text-sm">
                  {teacher.role === "teacher"
                    ? "معلمة"
                    : teacher.role === "assistant_teacher"
                    ? "معلمة مساعدة"
                    : teacher.role}
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-[var(--border)]" />

            {/* Info */}
            <div className="flex flex-col gap-2 text-sm text-[var(--text)]">

              <p className="flex text-md">
                <ChildrenIcon className="w-4 h-4 ml-1" /> عدد الأطفال :{" "}
                {teacher.teacherChildren?.length || 0}
              </p>
            </div>

            <div className="w-full h-px bg-[var(--border)]" />

            {/* التفاصيل + رقم الهاتف */}
            <div className="flex items-center justify-between w-full text-right">
              <div className="flex items-center text-md text-[var(--text)]">
                <PhoneIcon className="w-4 h-4 ml-1" />
                {teacher.phone}
              </div>

              <button className="text-sm underline text-[var(--text)] cursor-pointer">
                اعرض التفاصيل
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectorTeachers;
