"use client";

import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // فك تشفير التوكن
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setRole(decoded.role);
    } catch (e) {
      console.log("Error decoding token", e);
    }
  }, []);

  // لو لسه ما جبنا الدور
  if (!role) {
    return <div className="p-10 text-center">جاري التحقق ...</div>;
  }

  return (
    <div className="flex">
      {/* السايدبار */}
      <Sidebar role={role} />

      {/* صفحات الداشبورد */}
      <main className="flex-1 bg-[#f8f8f8] min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}