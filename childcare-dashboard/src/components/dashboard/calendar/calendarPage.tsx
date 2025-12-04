"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import EventModal, { EventItem } from "../popUps/AddEvent";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Calendar() {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  /* تاريخ صحيح بدون مشاكل */
  const getLocalDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<"list" | "add">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ========== جلب الأحداث ========== */
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/eventsAndNews");
      let data = res.data;

      if (data && Array.isArray(data.events)) data = data.events;

      const mapped: EventItem[] = data.map((ev: any) => ({
        id: ev._id,
        date: getLocalDateKey(new Date(ev.date)),
        title: ev.title,
        type: ev.type,
        visibility: ev.visibility,
        description: ev.description,
        createdBy: {
          fullName: ev.createdBy?.fullName || "غير معروف",
          _id: ev.createdBy?._id,
          role: ev.createdBy?.role,
        },
        images: ev.images ?? [],
        coverImage: ev.coverImage ?? null,
      }));

      setEvents(mapped);
    } catch (error) {
      console.error("Fetch Events Error:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ========== إضافة / تعديل حدث ========== */
  const handleAddEvent = async (event: EventItem) => {
    try {
      const formData = new FormData();

      formData.append("title", event.title);
      formData.append("description", event.description);
      formData.append("type", event.type);
      formData.append("visibility", event.visibility);
      formData.append("date", event.date);

      if (event.coverImageFile) {
        formData.append("coverImage", event.coverImageFile);
      }

      if (event.imageFiles && event.imageFiles.length > 0) {
        event.imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      if (editingId) {
        await axios.put(
          `http://localhost:5000/eventEdit/${editingId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("تم تعديل الحدث بنجاح");
      } else {
        await axios.post("http://localhost:5000/createEvent", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        alert("تم إضافة الحدث!");
      }

      setEditingId(null);
      fetchEvents();
    } catch (error: any) {
      console.error("Add/Edit Event Error:", error.response?.data || error);
    }
  };

  /* ========== تجميع الأحداث حسب اليوم ========== */
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days: { date: Date; inCurrentMonth: boolean }[] = [];

  for (let i = startOffset; i > 0; i--) {
    days.push({
      date: new Date(year, monthIndex, 1 - i),
      inCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: new Date(year, monthIndex, d),
      inCurrentMonth: true,
    });
  }

  while (days.length < 42) {
    const last = days[days.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    days.push({ date: next, inCurrentMonth: false });
  }

  const daysOfWeek = ["SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"];
  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  /* عند الضغط على يوم */
  const handleDayClick = (date: Date) => {
    const key = getLocalDateKey(date);
    setSelectedDate(key);
    setInitialMode("list");
    setEditingId(null);
    setIsModalOpen(true);
  };

  /* زر إضافة من الهيدر */
  const handleGlobalAddEvent = () => {
    const todayKey = getLocalDateKey(new Date());
    setSelectedDate(todayKey);
    setInitialMode("add");
    setEditingId(null);
    setIsModalOpen(true);
  };

  const eventsForSelectedDate =
    selectedDate && eventsByDate[selectedDate]
      ? eventsByDate[selectedDate]
      : [];

  return (
    <div dir="rtl" className="w-full max-w-[1350px] mx-auto flex flex-col gap-6 px-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)]">
            التقويم / الفعاليات والأخبار
          </h1>
        </div>

        <button
          onClick={handleGlobalAddEvent}
          className="px-6 h-[44px] bg-[#F9B236] text-white rounded-xl font-semibold shadow-sm"
        >
          إضافة حدث
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center gap-3 justify-end text-[var(--text)]">
        <button
          onClick={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
            )
          }
          className="w-8 h-8 border rounded-full"
        >
          ‹
        </button>

        <span className="text-lg mt-1 font-semibold">{monthLabel}</span>

        <button
          onClick={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
            )
          }
          className="w-8 h-8 border rounded-full"
        >
          ›
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-[16px] border border-[var(--border)] overflow-hidden">
        <div className="grid grid-cols-7 bg-[var(--card)] border-b border-[var(--border)] text-[var(--text)]">
          {daysOfWeek.map((d) => (
            <div key={d} className="h-[40px] flex items-center justify-center text-sm">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 auto-rows-[110px] md:auto-rows-[130px]">
          {days.map(({ date, inCurrentMonth }, idx) => {
            const key = getLocalDateKey(date);
            const dayEvents = eventsByDate[key] || [];

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(date)}
                className={`border border-[var(--border)] p-2 flex flex-col items-end ${
                  inCurrentMonth ? "bg-[var(--card)] text-[var(--text)]" : "bg-[var(--bordergray)] text-[var(--text)]"
                }`}
              >
                <span className="font-semibold">{date.getDate()}</span>

                <div className="flex flex-col w-full mt-1 gap-1">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-[rgba(249,178,54,0.12)] rounded-md px-2 h-[24px] flex items-center justify-end text-[11px] truncate"
                    >
                      {ev.title}
                    </div>
                  ))}

                  {dayEvents.length > 2 && (
                    <span className="text-[10px] text-gray-500">
                      +{dayEvents.length - 2} أحداث أخرى
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialMode("list");
          setEditingId(null);
        }}
        selectedDate={selectedDate}
        eventsForDate={eventsForSelectedDate}
        initialMode={initialMode}
        onAddEvent={handleAddEvent}
        currentUserId={user?._id}
        setEditingId={setEditingId}
      />
    </div>
  );
}
