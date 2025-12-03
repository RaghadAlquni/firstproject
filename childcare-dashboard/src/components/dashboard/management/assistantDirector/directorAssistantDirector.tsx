"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";


import PhoneIcon from "../../../../../public/icons/phone";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface AssistantDirector {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  branch: string;
  shift: string;
  avatar: string;
  childrenCount: number;
  director: {
    fullName: string;
  } | null;
}

const AdminAssistantDirector = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [assistants, setAssistants] = useState<AssistantDirector[]>([]);
  const [loading, setLoading] = useState(true);

  const getAllAssistants = async () => {
    try {
      console.log("🔵 TOKEN BEFORE REQUEST:", token);

      const res = await axios.get("http://localhost:5000/assistantDirectors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssistants(res.data.assistants);
    } catch (error: any) {
      console.log("❌ Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllAssistants();
  }, []);

  return (
    <main className="w-full bg-[var(--bg)] px-4 md:px-8 py-2">
      {/* العنوان */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-[24px] font-bold text-right text-[var(--text)]">
          <span className="text-[#d5d5d5] text-[20px] md:font-medium">
         الإدارة /
          </span>{" "}
          المديرين المساعدين
        </h1>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-[var(--text)] mt-10">جاري التحميل...</p>
      )}

      {/* لا يوجد */}
      {!loading && assistants.length === 0 && (
        <p className="text-center text-[var(--text)] mt-10">
          لا يوجد مديرين مساعدين
        </p>
      )}

      {/* الكروت */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assistants.map((assistant) => (
          <div
            key={assistant._id}
            className="w-full bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-4 flex flex-col gap-4"
          >
            {/* الصورة + الاسم */}
            <div className="flex items-center gap-4">
              <div
                className="w-18 h-18 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${assistant.avatar})` }}
              />

              <div className="flex flex-col text-right gap-1">
                <h3 className="text-lg font-bold mt-2 text-[var(--text)]">
                  {assistant.fullName}
                </h3>
                <p className="text-lg text-[var(--text)]">مديرة مساعدة</p>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* التفاصيل + رقم الهاتف */}
            <div className="flex items-center justify-between w-full text-right">
              <div className="flex items-center text-md text-[var(--text)]">
                <PhoneIcon className="w-4 h-4 ml-1" />
                {assistant.phone}
              </div>

              <button className="text-sm underline text-[var(--text)] cursor-pointer">
                اعرض التفاصيل
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AdminAssistantDirector;
