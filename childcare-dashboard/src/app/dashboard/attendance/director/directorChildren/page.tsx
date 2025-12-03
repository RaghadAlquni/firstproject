"use client";

import { useAppSelector } from "@/redux/hooks";
import DirectorCildrenAttendance from "@/components/dashboard/attendance/directorChildrenAttendance";

export default function DashboardDirectorAttendance() {

  const { user, loading } = useAppSelector((state) => state.auth);

  // 1) منع الـ Loop — لا ترندر شيء أثناء الـ hydration
  if (typeof window !== "undefined" && loading) return null;

  // 2) لو ما فيه يوزر نهائيًا
  if (!user) return <p>لم يتم تسجيل الدخول</p>;

  // 3) حسب الدور
  switch (user.role) {
    case "director":
      return <DirectorCildrenAttendance />;
    default:
      return <p>لا يوجد صفحة لهذا الدور</p>;
  }
  
}