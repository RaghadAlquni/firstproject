"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import Calendar from "../../../../public/icons/calendar";
import axios from "axios";

interface EventItem {
  date: string;
  title: string;
  day: string;
  type: string;
  numberDay: number;
}

function formatEvent(e: any) {
  const d = new Date(e.date);

  const days = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  return {
    numberDay: d.toLocaleDateString("en-US", { day: "numeric" }),
    date: d.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
    day: days[d.getDay()],
    title: e.title,
    type: e.type,
  };
}

export default function EventsSidebar() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const getEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/eventsAndNews");
        const formated = res.data.events.map((e: any) => formatEvent(e));
        setEvents(formated);
      } catch (error) {
        console.log("Error loading events:", error);
      }
    };
    getEvents();
  }, []);

  return (
    <>
      {/* زر الجوال */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#F9B236] shadow-sm flex items-center justify-center"
      >
        <Calendar />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
        ></div>
      )}

      {/* الـ Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-[220px]
          bg-[var(--card)] border border-[var(--border)]
          shadow-md md:shadow-none p-5 flex flex-col gap-1 transition-transform duration-300 z-50
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* زر إغلاق (جوال) */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden text-3xl self-end mb-4 text-[var(--text)]"
        >
          <FiX />
        </button>

        {/* العنوان */}
        <h2 className="text-xl font-bold text-[var(--text)] text-right">
          الفعاليات القادمة
        </h2>

        {/* القائمة */}
        <div className="flex flex-col gap-2 mt-2">
          {events.map((ev, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b border-[var(--border)] py-3"
            >
              {/* النص */}
              <div className="flex flex-col text-center w-full">
                <span className="text-[14px] font-medium text-[var(--text)]">
                  {ev.date}
                </span>
                <span className="text-[12px] text-[var(--text)]">
                  {ev.title}
                </span>
              </div>

              {/* الخلفية حسب النوع */}
              <div
                className={`w-[95px] h-[65px] rounded-2xl flex flex-col items-center justify-center 
                  ${
                    ev.type === "news"
                      ? "bg-[rgba(249,178,54,0.15)]"
                      : "bg-[rgba(23,179,220,0.15)]"
                  }
                `}
              >
                <span className="text-[18px] font-bold text-[var(--text)]">
                  {ev.numberDay}
                </span>
                <span className="text-[10px] text-[var(--text)]">
                  {ev.day}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
