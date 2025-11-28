"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface AddChildPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type TabType = "new" | "renew";

interface Teacher {
  _id: string;
  fullName: string;
}

interface Subscription {
  _id: string;
  name: string;
  durationType: string;
  price: number;
}

const API_BASE = "http://localhost:5000";

/* --------------------------------------------------------- */
/* 🔔 SweetAlert */
const showAlert = (options: any) => {
  Swal.fire({
    ...options,
    didOpen: () => {
      const el = document.querySelector(".swal2-container") as HTMLElement;
      if (el) el.style.zIndex = "20001";
    },
  });
};

/* --------------------------------------------------------- */
/* 🟦 بطاقة بيانات الطفل */
const ChildInfoCard = ({ child }: { child: any }) => {
  if (!child) return null;

  const statusColors: Record<string, string> = {
    "مؤكد": "bg-green-100 border-green-300 text-green-700",
    "مضاف": "bg-yellow-100 border-yellow-300 text-yellow-700",
    "غير مفعل": "bg-red-100 border-red-300 text-red-700",
  };

  return (
    <div className="w-full p-4 mb-4 rounded-xl border shadow-sm bg-white">
      <h3 className="text-lg font-bold text-gray-800 mb-2">بيانات الطفل</h3>

      <div
        className={`px-3 py-2 rounded-lg border text-sm font-semibold mb-3 ${
          statusColors[child.status]
        }`}
      >
        حالة الطفل: {child.status}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <p className="font-semibold">اسم الطفل:</p>
          <p>{child.childName}</p>
        </div>

        <div>
          <p className="font-semibold">السجل المدني:</p>
          <p>{child.idNumber}</p>
        </div>

        <div>
          <p className="font-semibold">الفرع:</p>
          <p>{child.branch?.branchName || "—"}</p>
        </div>

        <div>
          <p className="font-semibold">الشفت:</p>
          <p>{child.shift}</p>
        </div>

        {child.teacherMain && (
          <div>
            <p className="font-semibold">المعلمة المسؤولة:</p>
            <p>{child.teacherMain.fullName}</p>
          </div>
        )}

        {child.subscription && (
          <div>
            <p className="font-semibold">نوع الاشتراك:</p>
            <p>{child.subscription.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------------------------- */

const AddChildPopup: React.FC<AddChildPopupProps> = ({ open, setOpen }) => {
  const [activeTab, setActiveTab] = useState<TabType>("new");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  /* fetch teachers */
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/managedTeachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers || []);
    };
    load();
  }, [open]);

  /* fetch subscriptions */
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/mySubscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptions(res.data.subscriptions || []);
    };
    load();
  }, [open]);

  if (!open) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-2"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-xl p-6"
      >
        {/* close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          ×
        </button>

        {/* tabs */}
        <div className="flex justify-center mb-6 mt-10">
          <div className="w-full bg-white rounded-xl border border-gray-200 flex overflow-hidden shadow-sm">
            <button
              className={`flex-1 py-3 text-center ${
                activeTab === "new"
                  ? "text-[#F9B236] bg-[rgba(249,178,54,0.1)] border-t-[3px] border-[#F9B236] font-bold"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("new")}
            >
              تسجيل طفل جديد
            </button>

            <button
              className={`flex-1 py-3 text-center ${
                activeTab === "renew"
                  ? "text-[#F9B236] bg-[rgba(249,178,54,0.1)] border-t-[3px] border-[#F9B236] font-bold"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab("renew")}
            >
              تجديد اشتراك طفل
            </button>
          </div>
        </div>

        {activeTab === "new" ? (
          <NewChildForm teachers={teachers} subscriptions={subscriptions} />
        ) : (
          <RenewForm teachers={teachers} subscriptions={subscriptions} />
        )}
      </div>
    </div>
  );
};

export default AddChildPopup;

/* --------------------------------------------------------- */
/* 🟦 تسجيل طفل جديد + تحقق لكل الحقول */

const NewChildForm = ({ teachers, subscriptions }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [childInfo, setChildInfo] = useState<any>(null);
  const [childStatus, setChildStatus] = useState<string>("");

  const checkChild = async (civilId: any) => {
    if (!civilId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/children/${civilId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChildInfo(res.data.child);
      setChildStatus(res.data.child.status);
    } catch {
      setChildInfo(null);
      setChildStatus("new");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const fullName = (form.get("fullName") as string)?.trim();
    const civil = (form.get("civilId") as string)?.trim();
    const birthDate = (form.get("birthDate") as string)?.trim();
    const gender = (form.get("gender") as string)?.trim();

    const guardian1Name = (form.get("guardian1Name") as string)?.trim();
    const guardian1Relation = (form.get("guardian1Relation") as string)?.trim();
    const guardian1Phone = (form.get("guardian1Phone") as string)?.trim();

    const guardian2Name = (form.get("guardian2Name") as string)?.trim();
    const guardian2Relation = (form.get("guardian2Relation") as string)?.trim();
    const guardian2Phone = (form.get("guardian2Phone") as string)?.trim();

    const teacherId = (form.get("teacherId") as string)?.trim();
    const subscriptionId = (form.get("subscriptionId") as string)?.trim();

    /* ✅ تحقق من كل الحقول (كلها إلزامية) */
    if (
      !fullName ||
      !civil ||
      !birthDate ||
      !gender ||
      !guardian1Name ||
      !guardian1Relation ||
      !guardian1Phone ||
      !guardian2Name ||
      !guardian2Relation ||
      !guardian2Phone ||
      !teacherId ||
      !subscriptionId
    ) {
      return showAlert({
        icon: "warning",
        title: "بيانات ناقصة",
        text: "يرجى تعبئة جميع الحقول المطلوبة قبل تأكيد التسجيل.",
      });
    }

    /* ⛔ منطق الحالات حسب حالة الطفل في النظام */
    if (childStatus === "مؤكد")
      return showAlert({
        icon: "warning",
        title: "مسجل مسبقًا",
        text: "لا يمكن تسجيله مرة أخرى.",
      });

    if (childStatus === "مضاف")
      return showAlert({
        icon: "warning",
        title: "مضاف مسبقًا",
        text: "الطفل في قائمة الانتظار.",
      });

    if (childStatus === "غير مفعل")
      return showAlert({
        icon: "warning",
        title: "موجود مسبقًا",
        text: "اختاري تجديد الاشتراك.",
      });

    /* 🟢 تسجيل جديد فقط إذا new */
    const data = {
      childName: fullName,
      idNumber: civil,
      dateOfBirth: birthDate,
      gender,
      guardian: [
        {
          guardianName: guardian1Name,
          relationship: guardian1Relation,
          phoneNumber: guardian1Phone,
        },
        {
          guardianName: guardian2Name,
          relationship: guardian2Relation,
          phoneNumber: guardian2Phone,
        },
      ],
      teacherMain: teacherId,
      subscriptionId,
      branch: user.branch,
      shift: user.shift,
    };

    const token = localStorage.getItem("token");
    await axios.post(`${API_BASE}/children/add`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showAlert({
      icon: "success",
      title: "تم التسجيل",
      text: "تمت إضافة الطفل بنجاح",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <h2 className="text-[22px] font-bold text-gray-800">تسجيل طفل جديد</h2>

      <p className="text-sm text-gray-700 bg-[#FFF8E8] rounded-xl px-4 py-2 border border-[#FFE3A9]">
        <span className="font-semibold">تنبيه:</span> إذا كان الطفل مسجل مسبقًا، اختاري (تجديد اشتراك).
      </p>

      {childInfo && <ChildInfoCard child={childInfo} />}

      <Input name="fullName" label="اسم الطفل" placeholder="اسم الطفل" />

      <Input
        name="civilId"
        label="السجل المدني"
        placeholder="السجل المدني"
        onBlur={(e: any) => checkChild(e.target.value)}
      />

      <Input name="birthDate" type="date" label="تاريخ الميلاد" />

      <Select name="gender" label="الجنس">
        <option value="">اختر الجنس</option>
        <option value="بنت">بنت</option>
        <option value="ولد">ولد</option>
      </Select>

      <GuardianSection number={1} />
      <GuardianSection number={2} />

      <Select name="teacherId" label="المعلمة المسؤولة">
        <option value="">اختر المعلمة</option>
        {teachers.map((t: any) => (
          <option key={t._id} value={t._id}>
            {t.fullName}
          </option>
        ))}
      </Select>

      <Select name="subscriptionId" label="نوع الاشتراك">
        <option value="">اختر الاشتراك</option>
        {subscriptions.map((s: any) => (
          <option key={s._id} value={s._id}>
            {s.name} — {s.durationType} — {s.price} ريال
          </option>
        ))}
      </Select>

      <SubmitButton label="تأكيد التسجيل" />
    </form>
  );
};

/* --------------------------------------------------------- */
/* 🟣 تجديد اشتراك — مع تحقق إلزامي لكل الحقول */

const RenewForm = ({ teachers, subscriptions }: any) => {
  const [childInfo, setChildInfo] = useState<any>(null);

  const checkChild = async (civilId: any) => {
    if (!civilId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/children/${civilId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChildInfo(res.data.child);
    } catch {
      setChildInfo(null);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const civilId = (form.get("civilId") as string)?.trim();
    const teacherId = (form.get("teacherId") as string)?.trim();
    const subscriptionId = (form.get("subscriptionId") as string)?.trim();

    /* ✅ تحقق من كل الحقول */
    if (!civilId || !teacherId || !subscriptionId) {
      return showAlert({
        icon: "warning",
        title: "بيانات ناقصة",
        text: "يرجى تعبئة السجل المدني، اختيار المعلمة، واختيار الاشتراك قبل التجديد.",
      });
    }

    const child = childInfo;
    if (!child)
      return showAlert({
        icon: "error",
        title: "غير موجود",
        text: "لا يوجد طفل بهذا السجل المدني",
      });

    /* الحالات */
    if (child.status === "مؤكد")
      return showAlert({
        icon: "warning",
        title: "اشتراك فعال",
        text: "لا يمكن تجديده الآن.",
      });

    if (child.status === "مضاف")
      return showAlert({
        icon: "warning",
        title: "قائمة الانتظار",
        text: "لا يمكن التجديد.",
      });

    if (child.status !== "غير مفعل")
      return showAlert({
        icon: "warning",
        title: "لا يمكن التجديد",
        text: "الحالة غير مناسبة.",
      });

    const data = {
      childId: child._id,
      subscriptionId,
      teacherMain: teacherId,
    };

    const token = localStorage.getItem("token");
    await axios.post(`${API_BASE}/renewSubscription`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showAlert({ icon: "success", title: "تم التجديد", text: "تم تجديد الاشتراك" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <h2 className="text-[22px] font-bold text-gray-800">تجديد الاشتراك</h2>

      <p className="text-sm text-gray-700 bg-[#FFF8E8] rounded-xl px-4 py-2 border border-[#FFE3A9]">
        <span className="font-semibold">تنبيه:</span> لا يمكن التجديد لطفل اشتراكه ما زال فعالًا.
      </p>

      {childInfo && <ChildInfoCard child={childInfo} />}

      <Input
        name="civilId"
        label="السجل المدني"
        placeholder="السجل المدني"
        onBlur={(e: any) => checkChild(e.target.value)}
      />

      <Select name="teacherId" label="المعلمة المسؤولة">
        <option value="">اختر المعلمة</option>
        {teachers.map((t: any) => (
          <option key={t._id} value={t._id}>
            {t.fullName}
          </option>
        ))}
      </Select>

      <Select name="subscriptionId" label="نوع الاشتراك">
        <option value="">اختر الاشتراك</option>
        {subscriptions.map((s: any) => (
          <option key={s._id} value={s._id}>
            {s.name} — {s.durationType} — {s.price} ريال
          </option>
        ))}
      </Select>

      <SubmitButton label="تجديد الاشتراك" />
    </form>
  );
};

/* --------------------------------------------------------- */
/* عناصر مشتركة */

const Input = ({ name, label, placeholder, type = "text", onBlur }: any) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      onBlur={onBlur}
      className="h-[52px] rounded-lg border border-gray-300 bg-gray-100 px-3 text-right outline-none"
    />
  </div>
);

const Select = ({ name, label, children }: any) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <select
      name={name}
      className="h-[52px] rounded-lg border border-gray-300 bg-gray-100 px-3 text-right outline-none"
    >
      {children}
    </select>
  </div>
);

const GuardianSection = ({ number }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Input name={`guardian${number}Name`} label={`اسم ولي الأمر ${number}`} />
    <Input name={`guardian${number}Relation`} label="صلة القرابة" />
    <Input
      name={`guardian${number}Phone`}
      label="رقم التواصل"
      placeholder="05xxxxxxxx"
    />
  </div>
);

const SubmitButton = ({ label }: any) => (
  <div className="flex justify-center mt-3">
    <button
      type="submit"
      className="min-w-[180px] h-[52px] bg-[#F9B236] text-white rounded-full text-[17px] font-semibold shadow-md hover:bg-[#e6a62f] transition"
    >
      {label}
    </button>
  </div>
);
