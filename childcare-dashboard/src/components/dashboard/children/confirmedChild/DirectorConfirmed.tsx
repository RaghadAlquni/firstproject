"use client";
import React, { useEffect, useState } from "react";
import ProfileIcon from "../../../../../public/icons/profileIcon";
import RemoveUser from "../../../../../public/icons/removeUser";
import AddChildPopUp from "../../popUps/AddChild";

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
  gender: string;
  submittedAt: string;
  subscription?: {
    name: string;
    durationType: string;
  };
}

export default function DirectorConfirmed() {
  const [children, setChildren] = useState<Child[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ✨ Pop-up
  const [openPopup, setOpenPopup] = useState(false);

  // ********** Fetch children **********
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/confirmedChildren", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
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
      {/* ✨ البوب أب */}
      {openPopup && (
        <AddChildPopUp open={openPopup} setOpen={setOpenPopup} />
      )}

      <div className="w-full max-w-[1300px] mx-auto bg-[var(--bg)] my-2">
        {/* ===== Header ===== */}
        <div className="flex flex-row-reverse justify-between items-center mb-6">
          <button
            onClick={() => setOpenPopup(true)}
            className="bg-[#f9b236] text-white font-bold text-[14px] px-6 py-2 rounded-full"
          >
            <p className="mt-1">إضافة طفل</p>
          </button>

          <h1 className="text-[24px] font-bold text-right text-[var(--text)]">
            <span className="text-[#d5d5d5] text-[20px] md:font-medium">
              الأطفال
            </span>
            <span className="mx-1 text-[var(--text)] text-[20px] md:font-medium">
              /
            </span>
            <span>أطفال المركز</span>
          </h1>
        </div>

        {/* ========================= */}
        {/* Desktop TABLE */}
        {/* ========================= */}

        <div className="hidden md:block">
          <div className="bg-[var(--card)] rounded-[10px] border border-[var(--border)] overflow-hidden">
            <table className="w-full table-auto text-right border-collapse">
              {/* HEAD */}
              <thead className="bg-[rgba(249,178,54,0.1)] text-[var(--text)] font-bold">
                <tr className="border-b border-[var(--border)]">
                  <th className="p-4 border-l border-[var(--border)]">اسم الطفل</th>
                  <th className="p-4 border-l border-[var(--border)]">جنس الطفل</th>
                  <th className="p-4 border-l border-[var(--border)]">الأستاذة المسؤولة</th>
                  <th className="p-4 border-l border-[var(--border)]">أرقام أولياء الأمور</th>
                  <th className="p-4 border-l border-[var(--border)]">تاريخ التقديم</th>
                  <th className="p-4 border-l border-[var(--border)]">نوع الاشتراك</th>
                  <th className="p-4 border-l border-[var(--border)]">الإجراءات</th>
                </tr>
              </thead>

              {/* BODY */}
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
                      {item.gender}
                    </td>

                    <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                      {item.teacherMain?.fullName || "—"}
                    </td>

                    <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                      {item.guardian?.length > 0 ? (
                        item.guardian.map((g, idx) => (
                          <div key={idx} className="text-sm">
                            {g.phoneNumber} — {g.relationship}
                          </div>
                        ))
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                      {new Date(item.submittedAt).toLocaleDateString("ar-SA")}
                    </td>

                    <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                      {item.subscription?.durationType || "—"}
                    </td>

                    {/* الإجراءات */}
                <td className="p-3 flex justify-center gap-3">
                  <button className="w-8 h-8 pt-2 flex items-center justify-center cursor-pointer rounded-md bg-gray-100 hover:bg-gray-200 transition">
                    👁️
                  </button>

                  <button className="w-8 h-8 pt-2 flex items-center justify-center cursor-pointer rounded-md bg-gray-100 hover:bg-gray-200 transition">
                    ✏️
                  </button>

                  <button className="w-8 h-8 pt-2 flex items-center justify-center cursor-pointer rounded-md bg-red-100 hover:bg-red-200 transition">
                    🗑️
                  </button>
                </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

        {/* ========================= */}
        {/* Mobile CARDS */}
        {/* ========================= */}

        <div className="md:hidden flex flex-col gap-4 mt-4">
          {paginated.map((item) => (
            <div
              key={item._id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-[18px] font-bold text-[var(--text)]">{item.childName}</h2>
              </div>

              <div className="text-[14px] text-[var(--text)] flex flex-col gap-2">
                <p><span className="font-bold">الجنس:</span> {item.gender}</p>
                <p><span className="font-bold">الأستاذة:</span> {item.teacherMain?.fullName || "—"}</p>

                <div>
                  <span className="font-bold">أولياء الأمور:</span>
                  {item.guardian?.map((g, idx) => (
                    <p key={idx} className="text-sm">
                      {g.phoneNumber} — {g.relationship}
                    </p>
                  ))}
                </div>

                <p>
                  <span className="font-bold">التقديم:</span>{" "}
                  {new Date(item.submittedAt).toLocaleDateString("ar-SA")}
                </p>

                <p>
                  <span className="font-bold">الاشتراك:</span>{" "}
                  {item.subscription?.durationType || "—"}
                </p>
              </div>

              
                {/* Actions */}
              <div className="flex justify-end gap-4 mt-3">
                <button className="w-8 h-8 pt-2 flex items-center justify-center cursor-pointer rounded-md bg-gray-100 hover:bg-gray-200 transition">
                    👁️
                  </button>

                  <button className="w-8 h-8 pt-2 flex items-center justify-center cursor-pointer rounded-md bg-gray-100 hover:bg-gray-200 transition">
                    ✏️
                  </button>

                  <button className="w-8 h-8 pt-2 flex items-center justify-center cursor-pointer rounded-md bg-red-100 hover:bg-red-200 transition">
                    🗑️
                  </button>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Pagination ===== */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
            <p className="text-[#9e9e9e] text-[20px]">
              صفحة {page} من {totalPages}
            </p>

            {/* Pages */}
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
