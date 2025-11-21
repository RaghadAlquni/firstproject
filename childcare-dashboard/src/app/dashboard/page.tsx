"use client";

import { useAppSelector } from "@/redux/hooks";
import AdminHome from "@/components/dashboard/home/AdminHome";
import DirectorHome from "@/components/dashboard/home/DirectorHome";
import TeacherHome from "@/components/dashboard/home/TeacherHome";
import AssistantTeacherHome from "@/components/dashboard/home/AssistantTeacherHome";

export default function DashboardHome() {

  const { user, loading } = useAppSelector((state) => state.auth);

  // 1) منع الـ Loop — لا ترندر شيء أثناء الـ hydration
  if (typeof window !== "undefined" && loading) return null;

  // 2) لو ما فيه يوزر نهائيًا
  if (!user) return <p>لم يتم تسجيل الدخول</p>;

  // 3) حسب الدور
  switch (user.role) {
    case "admin":
      return <AdminHome />;
    case "director":
      return <DirectorHome />;
    case "teacher":
      return <TeacherHome />;
    case "assistant_teacher":
      return <AssistantTeacherHome />;
    default:
      return <p>لا يوجد صفحة لهذا الدور</p>;
  }
  
}