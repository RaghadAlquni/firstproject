"use client";
import React from "react";
import Link from "next/link";

const branchCards = [
  {
    branchName: "الفايزية",
    city: "بريدة",
    district: "الفايزية",
    img: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-13/hzhO1ntSxh.png",
  },
  {
    branchName: "الجزيرة",
    city: "بريدة",
    district: "الجزيرة",
    img: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-13/hzhO1ntSxh.png",
  },
  {
    branchName: "عسيب",
    city: "بريدة",
    district: "الجنوب",
    img: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-13/hzhO1ntSxh.png",
  },
];

const Branch = () => {
  return (
    <section id="Brnach" className="relative w-full py-16 pt-20 overflow-hidden">

      {/* الخلفية */}
      <div className="absolute inset-0 bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-13/LUOrLgnyOU.png')] bg-cover bg-no-repeat opacity-100"></div>

      {/* المحتوى */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 md:pt-9 text-center">

        {/* العنوان */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#282828] mb-6 leading-tight text-center mx-auto w-full flex justify-center">
          ضيافات <span className="text-[#F9B236] mx-2">واحة المعرفة</span>
        </h1>

        {/* الكروت */}
        <div className="mt-12 flex flex-col lg:flex-row justify-center items-stretch gap-8">

          {branchCards.map((branch, index) => (
            <div
              key={index}
              className="
                group relative flex flex-col items-center 
                bg-white rounded-[20px] overflow-hidden
                border border-[#f1f1f1] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]
                w-full lg:max-w-[380px]
                transition-all duration-500 hover:-translate-y-1 mx-auto
              "
            >

              {/* 🔗 رابط الصورة */}
              <Link
                href={branch.img}
                target="_blank"
                className="
                  absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 
                  transition-all duration-500 bg-white/70 backdrop-blur-sm
                  p-2 rounded-full
                "
              >
                
              </Link>

              {/* 🌟 الصورة نفسها (backgroundImage) */}
              <div
                className="w-full h-[240px] bg-cover bg-center"
                style={{ backgroundImage: `url(${branch.img})` }}
              ></div>

              {/* النص */}
              <div className="py-6 flex flex-col gap-2 text-right w-full px-4">
                <span className="text-[20px] font-medium text-[#4d4c4c]">
                  فرع
                </span>

                <span className="text-[26px] font-bold text-[#f9b236]">
                  {branch.branchName}
                </span>

                <span className="text-[18px] text-[#7b7b7b]">
                  {branch.city}، حي {branch.district}
                </span>
              </div>
            </div>
          ))}

        </div>

        {/* زر المزيد */}
        <div className="mt-10 flex justify-center">
          <button className="
            bg-[#f9b236] text-white text-[20px] 
            font-medium rounded-full 
            px-10 py-3 shadow-md
            hover:bg-[#e7a22e] transition
          ">
            المزيد من الضيافات
          </button>
        </div>

      </div>
    </section>
  );
};

export default Branch;