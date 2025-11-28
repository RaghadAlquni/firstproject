"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Guardian {
  phoneNumber: string;
  relationship: string;
}

interface ChildRow {
  id: string;
  name: string;
  age: string;
  subscriptionType: string;
  guardian: Guardian[];
}

interface Teacher {
  _id: string;
  fullName: string;
}

export default function WaitingChildren() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [search, setSearch] = useState("");

  const [children, setChildren] = useState<ChildRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<string[]>([]);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");

  const allSelected =
    selected.length === children.length && children.length > 0;

const filteredChildren = children.filter((child) => {
  const s = search.trim();

  const matchesName =
    child.name.toLowerCase().includes(s.toLowerCase());

  const matchesGuardian =
    child.guardian.some((g) =>
      g.phoneNumber.includes(s)
    );

  return (matchesName || matchesGuardian);
});


  // ================================
  //           GET CHILDREN
  // ================================
  const getChildren = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/waitingChildren", {
        params: {
          branch: user?.branch,
          shift: user?.shift,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formatted = res.data.children.map((c: any) => ({
        id: c._id,
        name: c.childName,
        age: `${c.age} سنوات`,
        subscriptionType: c.subscription?.name || "—",
        guardian: Array.isArray(c.guardian) ? c.guardian : [],
      }));

      setChildren(formatted);
    } catch (err) {
      console.log("ERROR FETCHING CHILDREN", err);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  //           GET TEACHERS
  // ================================
  const getTeachers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/managedTeachers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeachers(res.data.teachers);
    } catch (error) {
      console.log("error fetching teachers", error);
    }
  };

  useEffect(() => {
    if (token) {
      getChildren();
      getTeachers();
    }
  }, [token]);

  // ================================
  //       Select All & One
  // ================================
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(children.map((c) => c.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ================================
  //        Confirm Many
  // ================================
  const confirmMany = async () => {
    try {
      await axios.put(
        "http://localhost:5000/confirmMany",
        {
          ids: selected,
          teacherMain: selectedTeacher,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "تم تأكيد الأطفال وتعيين المعلمة",
        timer: 1500,
        showConfirmButton: false,
      });

      setChildren((prev) =>
        prev.filter((c) => !selected.includes(c.id))
      );
      setSelected([]);
      setSelectedTeacher("");
      setShowTeacherModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ أثناء التأكيد",
      });
    }
  };

  // ================================
  //        Delete Many
  // ================================
  const deleteMany = async () => {
    try {
      await axios.delete("http://localhost:5000/deleteMany", {
        data: { ids: selected },
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "تم حذف الأطفال المختارين",
        timer: 1500,
        showConfirmButton: false,
      });

      setChildren((prev) => prev.filter((c) => !selected.includes(c.id)));
      setSelected([]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ أثناء الحذف",
      });
    }
  };

  // ================================
  //              UI
  // ================================
  return (
    <div className="w-full mx-auto p-4">

      <h1 className="text-[24px] font-bold text-right text-[var(--text)]">
        <span className="text-[#d5d5d5] text-[20px] md:font-medium">الأطفال</span>
        <span className="mx-1 text-[var(--text)] text-[20px] md:font-medium">/</span>
        <span>قائمة الأطفال </span>
      </h1>

      <input
  type="text"
  placeholder="ابحث باسم الطفل أو رقم ولي الأمر"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full p-2 bg-[var(--bg)] text-[12px] border border-[var(--border)] px-4 text-[var(--text)] placeholder-[#D5D5D5] rounded-lg my-2"
/>
 
      {/* TABLE */}
      <div className="bg-[var(--card)] border border-[var(--border)] overflow-x-auto md:overflow-visible mt-4 max-w-[310px] mx-auto md:max-w-none">

            <table className="min-w-[500px] md:min-w-0 w-full table-auto text-right border-collapse">

          <thead className="bg-[rgba(249,178,54,0.1)] text-[var(--text)] font-bold">
            <tr className="border-b border-[var(--border)]">

              {/* Checkbox – ALWAYS VISIBLE */}
              <th className="p-4 border-l border-[var(--border)]">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
              </th>

              {/* Name – ALWAYS VISIBLE */}
              <th className="p-4 border-l border-[var(--border)]">اسم الطفل</th>

              {/* AGE – HIDDEN ON MOBILE */}
              <th className="p-4 border-l border-[var(--border)] hidden md:table-cell">
                العمر
              </th>

              {/* Subscription – HIDDEN ON MOBILE */}
              <th className="p-4 border-l border-[var(--border)] hidden md:table-cell">
                نوع الاشتراك
              </th>

              {/* Guardian – HIDDEN ON MOBILE */}
              <th className="p-4 border-l border-[var(--border)] hidden md:table-cell">
                رقم ولي الأمر
              </th>

              {/* Actions – HIDDEN ON MOBILE */}
              <th className="p-4 border-l border-[var(--border)] hidden md:table-cell">
                الإجراءات
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredChildren.map((child) => (
              <tr
                key={child.id}
                className="border-b border-[var(--border)] hover:bg-[var(--bordergray)] transition"
              >

                {/* Checkbox */}
                <td className="p-4 border-l border-[var(--border)]">
                  <input
                    type="checkbox"
                    checked={selected.includes(child.id)}
                    onChange={() => toggleOne(child.id)}
                  />
                </td>

                {/* Name */}
                <td className="p-4 border-l border-[var(--border)] text-[var(--text)]">
                  {child.name}
                </td>

                {/* AGE */}
                <td className="p-4 border-l border-[var(--border)] text-[var(--text)] hidden md:table-cell">
                  {child.age}
                </td>

                {/* Subscription */}
                <td className="p-4 border-l border-[var(--border)] text-[var(--text)] hidden md:table-cell">
                  {child.subscriptionType}
                </td>

                {/* Guardian */}
                <td className="p-4 border-l border-[var(--border)] hidden text-[var(--text)] md:table-cell">
                  {child.guardian.length > 0 ? (
                    child.guardian.map((g, idx) => (
                      <div key={idx} className="text-sm">
                        {g.phoneNumber} — {g.relationship}
                      </div>
                    ))
                  ) : (
                    "—"
                  )}
                </td>

                {/* Actions */}
                <td className="p-4 gap-3 justify-center hidden md:flex">
                  <button className="w-8 h-8 pt-2 flex items-center justify-center cursor-pointer rounded-md bg-gray-100 hover:bg-gray-200 transition">
                    ✉️
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

      {/* ACTION BUTTONS */}
      {selected.length > 0 && (
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => setShowTeacherModal(true)}
            className="px-6 py-3 bg-[#F9B236] text-white rounded-full font-bold">
            <p className="mt-1"> تفعيل المختارين </p>
          </button>

          <button
            onClick={deleteMany}
            className="px-6 py-3 bg-red-500 text-white rounded-full font-bold">
            <p className="mt-1"> رفض المختارين </p>
          </button>
        </div>
      )}

      {/* MODAL */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[350px] shadow-lg">

            <h2 className="text-xl font-bold mb-4 text-center">اختيار معلمة</h2>

            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full p-2 border rounded-full mb-4"
            >
              <option value="">اختيار معلمة</option>

              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName}
                </option>
              ))}
            </select>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowTeacherModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-full">
                <p className="mt-1"> إلغاء </p>
              </button>

              <button
                onClick={confirmMany}
                disabled={!selectedTeacher}
                className="px-4 py-2 bg-[#F9B236] text-white rounded-full disabled:bg-gray-300">
                <p className="mt-1"> تأكيد </p>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
