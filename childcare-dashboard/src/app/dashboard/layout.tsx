"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import Navbar from "@/components/dashboard/navbar/navbar";
import EventList from "@/components/dashboard/eventList/eventList";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { loginSuccess } from "@/redux/authSlice";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (!saved) return;
    dispatch(loginSuccess(saved));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* السايد بار ثابت */}
      <Sidebar role={role || ""} />

      {/* العمود الرئيسي */}
      <div className="flex flex-col flex-1 h-full bg-[var(--bg)]">

        {/* النافبار */}
        <Navbar />

        {/* المحتوى + الايفنت ليست */}
        <div className="flex flex-1 overflow-hidden">

          {/* المحتوى (الوسط) → هو الوحيد اللي يتحرك */}
          <main className="flex-1 p-6 overflow-y-auto ">
            {children}
          </main>

          {/* الايفنت ليست ثابتة */}
          <EventList />

        </div>
      </div>
    </div>
  );
}
