"use client";

import { useAppSelector } from "@/redux/hooks";
import AdminConfirmed from "@/components/dashboard/children/confirmedChild/AdminConfirmed";
import DirectorConfirmed from "@/components/dashboard/children/confirmedChild/DirectorConfirmed";
import TeacherConfirmed from "@/components/dashboard/children/confirmedChild/TeacherConfirmed";

export default function DashboardHome() {

  const { user, loading } = useAppSelector((state) => state.auth);

  // 1) منع الـ Loop — لا ترندر شيء أثناء الـ hydration
  if (typeof window !== "undefined" && loading) return null;

  // 2) لو ما فيه يوزر نهائيًا
  if (!user) return <p>لم يتم تسجيل الدخول</p>;

  // 3) حسب الدور
  switch (user.role) {
    case "admin":
      return <AdminConfirmed />;
    case "director":
      return <DirectorConfirmed />;
    case "teacher":
      return <TeacherConfirmed />;
    default:
      return <p>لا يوجد صفحة لهذا الدور</p>;
  }
  
}