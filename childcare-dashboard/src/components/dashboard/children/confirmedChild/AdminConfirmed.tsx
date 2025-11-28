"use client";
import React, { useEffect, useState } from "react";
import ProfileIcon from "../../../../../public/icons/profileIcon";
import RemoveUser from "../../../../../public/icons/removeUser";

interface Guardian {
  phoneNumber: string;
  relationship: string;
}

interface Child {
  _id: string;
  childName: string;
  guardian: Guardian[];
  teacherMain?: { fullName: string };
  branch?: { branchName: string };
  shift: string;
  subscription?: { name: string; durationType: string };
  submittedAt: string;
}

export default function AdminConfirmed() {
  const [children, setChildren] = useState<Child[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // ********** جلب الأطفال من الباك **********
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/confirmedChildren", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log("FROM BACK:", data);

        if (data.children) setChildren(data.children);
      } catch (err) {
        console.log("Error fetching children:", err);
      }
    };

    fetchChildren();
  }, []);

  const totalPages = Math.ceil(children.length / pageSize);
  const paginated = children.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>

    <div className="w-full max-w-[1300px] mx-auto bg-[var(--bg)] my-2">
      
      {/* ===== Header ===== */}
      <div className="flex flex-row justify-between items-center mb-6">

        <h1 className="text-[24px] font-bold text-right text-[var(--text)]">
          <span className="text-[#d5d5d5] text-[20px] md:font-meduim">الرئيسية</span>
          <span className="mx-1 text-[var(--text)] text-[20px] md:font-meduim"> / </span>

          <span>أطفال المركز</span>
        </h1>
      </div>

      {/* ========================================================= */}
      {/* ===== TABLE FOR DESKTOP + TABLET (md and up) ============ */}
      {/* ========================================================= */}
      <div className="hidden md:block">
        <div className="bg-[var(--card)] rounded-[10px] border border-[var(--border)] overflow-hidden">
          <table className="w-full table-auto text-right border-collapse">
            <thead className="bg-[rgba(249,178,54,0.1)] text-[var(--text)] font-bold">
              <tr className="border-b border-[var(--border)]">
                <th className="p-4 border-l border-[var(--border)]">اسم الطفل</th>
                <th className="p-4 border-l border-[var(--border)]">الأستاذة</th>
                <th className="p-4 border-l border-[var(--border)]">أولياء الأمور</th>
                <th className="p-4 border-l border-[var(--border)]">الفرع</th>
                <th className="p-4 border-l border-[var(--border)]">الفترة</th>
                <th className="p-4 border-l border-[var(--border)]">تاريخ التقديم</th>
                <th className="p-4 border-l border-[var(--border)]">نوع الاشتراك</th>
                <th className="p-4 border-l border-[var(--border)]">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-[var(--border)] hover:bg-[var(--bordergray)] transition"
                >
                  <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                    {item.childName}
                  </td>

                  <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                    {item.teacherMain?.fullName || "—"}
                  </td>

                  <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                    {item.guardian?.length > 0
                      ? item.guardian.map((g, idx) => (
                          <div key={idx} className="text-sm">
                            {g.phoneNumber} — {g.relationship}
                          </div>
                        ))
                      : "—"}
                  </td>

                  <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                    {item.branch?.branchName || "—"}
                  </td>

                  <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                    {item.shift}
                  </td>

                  <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                    {new Date(item.submittedAt).toLocaleDateString("ar-SA")}
                  </td>

                  <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                    {item.subscription?.durationType || "—"}
                  </td>

                  <td className="p-4 border-l border-[var(--border)]">
                    <div className="flex justify-start gap-2">
                      <ProfileIcon className="w-[24px] h-[24px] text-[var(--text)] cursor-pointer" />
                      <span className="text-[var(--text)]"> + </span>
                      <RemoveUser className="w-[24px] h-[24px] text-[var(--text)] cursor-pointer" />
                    </div>
                  </td>
                  
                </tr>

                
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* =============== MOBILE CARDS (ONLY MOBILE) ============== */}
      {/* ========================================================= */}
      <div className="block md:hidden mt-4 space-y-4">

        {paginated.map((item) => (
          <div 
            key={item._id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm"
          >

            {/* العنوان + الإجراءات */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[18px] font-bold text-[var(--text)]">
                {item.childName}
              </h2>

              <div className="flex items-center gap-2">
                <ProfileIcon className="w-[22px] h-[22px] text-[var(--text)]" />
                <span className="text-[var(--text)] font-bold">+</span>
                <RemoveUser className="w-[22px] h-[22px] text-[var(--text)]" />
              </div>
            </div>

            {/* التفاصيل */}
            <p className="text-[var(--text)] text-sm mb-1">
              <span className="font-bold">الأستاذة: </span>
              {item.teacherMain?.fullName || "—"}
            </p>

            <div className="text-[var(--text)] text-sm mb-1">
              <span className="font-bold">أولياء الأمور:</span>
              <div className="mt-1 space-y-1">
                {item.guardian?.map((g, idx) => (
                  <p key={idx} className="text-[13px] opacity-80">
                    {g.phoneNumber} — {g.relationship}
                  </p>
                ))}
              </div>
            </div>

            <p className="text-[var(--text)] text-sm mb-1">
              <span className="font-bold">الفرع: </span>
              {item.branch?.branchName || "—"}
            </p>

            <p className="text-[var(--text)] text-sm mb-1">
              <span className="font-bold">الفترة: </span>
              {item.shift}
            </p>

            <p className="text-[var(--text)] text-sm mb-1">
              <span className="font-bold">تاريخ التقديم: </span>
              {new Date(item.submittedAt).toLocaleDateString("ar-SA")}
            </p>

            <p className="text-[var(--text)] text-sm">
              <span className="font-bold">نوع الاشتراك: </span>
              {item.subscription?.durationType || "—"}
            </p>

          </div>
        ))}

      </div>

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-[#9e9e9e] text-[20px]">
            صفحة {page} من {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="text-[var(--text)] disabled:opacity-30"
            >
              ←
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const number = idx + 1;
              return (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`px-4 py-2 rounded border ${
                    page === number
                      ? "bg-[#f9b236] text-white"
                      : "bg-white text-[#9e9e9e]"
                  }`}
                >
                  {number}
                </button>
              );
            })}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="text-[var(--text)] disabled:opacity-30"
            >
              →
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-[#9e9e9e] text-[20px]">Show</span>
            <div className="px-4 py-2 border rounded bg-white text-[#9e9e9e]">
              10
            </div>
          </div>

        </div>
      )}
    </div>
    </>
  );
}
