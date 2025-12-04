"use client";

import React, { useEffect, useState } from "react";

export interface EventItem {
  id: string;
  date: string;
  title: string;
  type: "event" | "news";
  visibility: "center" | "public";
  description: string;
  createdBy: { fullName: string; _id?: string; role?: string };
  images?: string[];
  coverImage?: string | null;

  // ملفات يتم إرسالها للباك
  coverImageFile?: File | null;
  imageFiles?: File[];
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  eventsForDate: EventItem[];
  initialMode: "list" | "add";
  onAddEvent: (event: EventItem) => void;
  currentUserId?: string;

  // للفرونت عشان نعرف إذا المستخدم يعدل
  setEditingId: (id: string | null) => void;
}

const translateRole = (role?: string) => {
  if (!role) return "غير معروف";
  const map: Record<string, string> = {
    director: "مديرة",
    assistant_director: "مساعدة مديرة",
    teacher: "معلمة",
    assistant_teacher: "معلمة مساعدة",
  };
  return map[role] || role;
};

export default function EventModal({
  isOpen,
  onClose,
  selectedDate,
  eventsForDate,
  initialMode,
  onAddEvent,
  currentUserId,
  setEditingId,
}: EventModalProps) {
  const [mode, setMode] = useState<"list" | "add" | "view">("list");
  const [viewEvent, setViewEvent] = useState<EventItem | null>(null);

  // فورم البيانات
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"event" | "news">("event");
  const [visibility, setVisibility] = useState<"center" | "public">("center");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedDate || "");

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // عند فتح البوب أب
  useEffect(() => {
    if (!isOpen) return;

    setMode(initialMode);
    setViewEvent(null);

    setTitle("");
    setType("event");
    setVisibility("center");
    setDescription("");
    setDate(selectedDate || "");

    setCoverImageFile(null);
    setImageFiles([]);
    setPreviewImages([]);

  }, [isOpen, initialMode, selectedDate]);

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // صورة الغلاف
  const handleCoverImage = (file: File | null) => {
    setCoverImageFile(file);
  };

  // صور إضافية
  const handleImagesUpload = (files: FileList | null) => {
    if (!files) return;

    const arr = Array.from(files);
    const previews = arr.map((f) => URL.createObjectURL(f));

    setImageFiles(arr);
    setPreviewImages(previews);
  };

  // إضافة / تعديل الحدث
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const event: EventItem = {
      id: Date.now().toString(),
      title,
      description,
      type,
      visibility,
      date,
      createdBy: {
        fullName: "أنتِ",
        _id: currentUserId,
      },
      images: previewImages,
      coverImage: coverImageFile ? URL.createObjectURL(coverImageFile) : null,

      coverImageFile,
      imageFiles,
    };

    onAddEvent(event);
    setEditingId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative"
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-3 left-4 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
        >
          ×
        </button>

        {/* ================= تفاصيل الحدث ================= */}
        {mode === "view" && viewEvent && (
          <>
            <h2 className="text-xl font-bold mb-2">{viewEvent.title}</h2>
            <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>

            <p className="text-sm mb-3">{viewEvent.description}</p>

            <div className="flex gap-2 mb-3">
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                {viewEvent.type === "event" ? "فعالية" : "خبر"}
              </span>

              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                {viewEvent.visibility === "center"
                  ? "خاص بالمركز"
                  : "عام للجميع"}
              </span>
            </div>

            {/* الناشر */}
            <p className="text-sm text-gray-600">الناشر: {viewEvent.createdBy.fullName}</p>
            <p className="text-sm text-gray-600 mb-3">
              الدور: {translateRole(viewEvent.createdBy.role)}
            </p>

            {/* الصور */}
            {viewEvent.images && viewEvent.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {viewEvent.images.map((img, i) => (
                  <img key={i} src={img} className="w-full h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}

            {/* إذا المستخدم هو صاحب الحدث */}
            {viewEvent.createdBy._id === currentUserId && (
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setTitle(viewEvent.title);
                    setDescription(viewEvent.description);
                    setVisibility(viewEvent.visibility);
                    setType(viewEvent.type);
                    setDate(viewEvent.date);

                    setPreviewImages(viewEvent.images ?? []);

                    setEditingId(viewEvent.id);
                    setMode("add");
                  }}
                  className="flex-1 bg-blue-500 text-white rounded-full py-2 text-sm"
                >
                  ✏️ تعديل
                </button>

                <button
                  type="button"
                  className="flex-1 bg-red-500 text-white rounded-full py-2 text-sm"
                >
                  🗑 حذف
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setMode("list");
                setViewEvent(null);
              }}
              className="mt-5 w-full bg-gray-200 rounded-full py-2 text-sm"
            >
              رجوع
            </button>
          </>
        )}

        {/* ================= قائمة أحداث اليوم ================= */}
        {mode === "list" && (
          <>
            <h2 className="text-xl font-bold mb-2">أحداث يوم {formattedDate}</h2>

            {eventsForDate.length === 0 && (
              <p className="text-gray-500 text-sm">لا توجد أحداث في هذا اليوم</p>
            )}

            <div className="flex flex-col gap-3 mt-3">
              {eventsForDate.map((ev) => (
                <div key={ev.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-semibold">{ev.title}</span>

                    <button
                      onClick={() => {
                        setViewEvent(ev);
                        setMode("view");
                      }}
                      className="text-xs text-blue-600 underline"
                    >
                      التفاصيل
                    </button>
                  </div>

                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full mt-1">
                    {ev.type === "event" ? "فعالية" : "خبر"}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setMode("add")}
              className="mt-5 w-full bg-[#F9B236] text-white rounded-full py-2 text-sm"
            >
              إضافة حدث جديد في هذا اليوم
            </button>
          </>
        )}

        {/* ================= إضافة / تعديل ================= */}
        {mode === "add" && (
          <>
            <h2 className="text-xl font-bold mb-3">
              {viewEvent ? "تعديل الحدث" : "إضافة حدث جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-sm">التاريخ</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">العنوان</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm">النوع</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "event" | "news")}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    <option value="event">فعالية</option>
                    <option value="news">خبر</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm">الظهور</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as "center" | "public")}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    <option value="center">خاص بالمركز</option>
                    <option value="public">عام للجميع</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">الوصف</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">صورة الغلاف</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverImage(e.target.files?.[0] || null)}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">صور إضافية</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImagesUpload(e.target.files)}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {previewImages.map((img, i) => (
                    <img key={i} src={img} className="w-full h-20 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 mt-3 bg-[#F9B236] text-white rounded-full font-semibold text-sm"
              >
                حفظ الحدث
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("list");
                  setViewEvent(null);
                  setEditingId(null);
                }}
                className="w-full py-2 bg-gray-200 rounded-full text-gray-700 mt-3 text-sm"
              >
                إلغاء والعودة
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
