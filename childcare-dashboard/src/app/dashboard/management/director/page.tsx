"use client";

import { useAppSelector } from "@/redux/hooks";
import DirectorAdmin from "@/components/dashboard/management/director/adminDirector";

export default function DashboardHome() {

  const { user, loading } = useAppSelector((state) => state.auth);

  // 1) منع الـ Loop — لا ترندر شيء أثناء الـ hydration
  if (typeof window !== "undefined" && loading) return null;

  // 2) لو ما فيه يوزر نهائيًا
  if (!user) return <p>لم يتم تسجيل الدخول</p>;

  // 3) حسب الدور
  switch (user.role) {
    case "admin":
      return <DirectorAdmin />;
    default:
      return <p>لا يوجد صفحة لهذا الدور</p>;
  }
  
}