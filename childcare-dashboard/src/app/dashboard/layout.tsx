"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { decodeRoleFromToken } from "@/Reducer/loginReducer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const extractedRole = decodeRoleFromToken(token);
    if (!extractedRole) {
      router.push("/login");
      return;
    }

    setRole(extractedRole);

  }, [router]);

  // ⏳ لو ما عرفنا الرول لسه — لا نعرض شي
  if (!role) {
    return <div className="w-full h-screen flex justify-center items-center">جاري التحميل...</div>;
  }

  return (
    <div className="flex flex-row-reverse">
      {/* ◀ السايدبار */}
      <Sidebar role={role} />

      {/* ◀ صفحة المحتوى */}
      <main className="flex-1 p-6 bg-[#f9f9f9]">
        {children}
      </main>
    </div>
  );
}