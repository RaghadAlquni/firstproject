"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ChildrenIcon from "../../../../public/icons/childrenIcon";
import ClockIcon from "../../../../public/icons/clock";
import HomeIcon from "../../../../public/icons/homeIcon";
import PhoneIcon from "../../../../public/icons/phone";
import ManagerIcon from "../../../../public/icons/managerIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Branch {
  id: string;
  name: string;
}

interface Teacher {
  _id: string;
  fullName: string;
  role: string;
  branch: {
    _id: string;
    branchName: string;
  } | string;
  shift: string;
  directorId?: { fullName: string } | null;
  phone: string;
  teacherChildren?: any[];
  avatar: string;
}

const adminTeacher = () => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const token = useSelector((state: RootState) => state.auth.token);

  /* --------------------------------------- */
  /* جلب بيانات المعلمين باستخدام Axios */
  /* --------------------------------------- */
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        if (!token) {
  console.error("⚠️ No token found in Redux!");
}
        const res = await axios.get("http://localhost:5000/teachers/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTeachers(res.data);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching teachers:", error.response?.data || error);
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  /* --------------------------------------- */
  /* تصفية حسب الفرع */
  /* --------------------------------------- */
  const filteredTeachers = selectedBranch
    ? teachers.filter((t) =>
        typeof t.branch === "object"
          ? t.branch.branchName === selectedBranch.name
          : t.branch === selectedBranch.name
      )
    : teachers;

  if (loading) {
    return (
      <p className="text-[var(--text)] text-center mt-10">جاري التحميل…</p>
    );
  }

  /* استخراج قائمة الفروع الفعلية من البيانات */
  const branchOptions: Branch[] = [
    ...new Map(
      teachers
        .map((t) =>
          typeof t.branch === "object"
            ? { id: t.branch._id, name: t.branch.branchName }
            : null
        )
        .filter(Boolean)
        .map((b: any) => [b.id, b])
    ).values(),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* العنوان */}
      <h1 className="text-[24px] font-bold text-right text-[var(--text)]">
        <span className="text-[#d5d5d5] text-[20px] md:font-medium">
          المعلمات /
        </span>{" "}
        المعلمات الرئيسيات والمعلمات المساعدات
      </h1>
      
      {/* اختيار الفرع */}
      <div className="w-full relative">
        <div
          onClick={() => setOpen(!open)}
          className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 cursor-pointer flex items-center justify-between shadow-sm transition"
        >
          <span className="font-semibold text-[var(--text)]">
            {selectedBranch ? selectedBranch.name : "اختر فرع"}
          </span>
          <span className="text-[var(--text)]">▾</span>
        </div>

        {open && (
          <div className="absolute mt-2 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-2 flex flex-col w-full">
            {branchOptions.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  setSelectedBranch(branch);
                  setOpen(false);
                }}
                className="text-right px-3 py-2 rounded-lg hover:bg-[var(--bordergray)] text-[var(--text)]"
              >
                {branch.name}
              </button>
            ))}
          </div>
        )}
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
                <HomeIcon className="w-4 h-4 ml-1" />
                الفرع: {typeof teacher.branch === "object"
                  ? teacher.branch.branchName
                  : teacher.branch}
              </p>

              <p className="flex text-md">
                <ClockIcon className="w-4 h-4 ml-1" /> الفترة : {teacher.shift}
              </p>

              <p className="flex text-md">
                <ManagerIcon className="w-4 h-4 ml-1" /> المدير المباشر : {teacher.directorId?.fullName || "غير محدد"}
              </p>

              <p className="flex text-md">
                <ChildrenIcon className="w-4 h-4 ml-1" /> الأطفال : {teacher.teacherChildren?.length || 0}
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

export default adminTeacher;
