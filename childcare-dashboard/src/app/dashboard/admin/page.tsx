"use client";

const adminPage = () => {
  return (
    <div className="w-full h-full flex flex-col gap-6">

      {/* العنوان */}
      <h1 className="text-2xl font-bold text-[#3b3b3b]">
        لوحة التحكم — المسؤول (Admin)
      </h1>

      {/* المحتوى التجريبي */}
      <div className="w-full p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <p className="text-lg text-gray-600">
          أهلاً بك في لوحة تحكم الأدمن!  
          👑  
          يمكنك رؤية الإحصائيات العامة هنا.
        </p>
      </div>

    </div>
  );
}
export default adminPage;