"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks, SidebarItem } from "@/constants/sidebarLinks";


interface Props {
  role: string;
}

export default function Sidebar({ role }: Props) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggle = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const links: SidebarItem[] = sidebarLinks[role] || [];

  return (
    <aside
      dir="rtl"
      className="w-[270px] h-screen bg-white border-l border-[#E5E5E5] p-4 pt-6 flex flex-col items-end overflow-y-auto"
    >
      {/* اللوجو */}
      <div className="flex w-full items-center gap-3 mb-6 justify-start">
        <img
          src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/MAQC2DtLvm.png"
          width={45}
          height={45}
          alt="logo"
        />
        <h1 className="text-[22px] font-bold text-[#F9B236]">واحة المعرفة</h1>
      </div>

      {/* البحث */}
      <div className="w-full flex items-center bg-[#F5F5F5] border border-[#CBCBCB] rounded-[13px] py-2 px-3 mb-6 justify-between">
        <input
          type="text"
          placeholder="ابحث عن موظف او طالب او فرع"
          className="flex-1 bg-transparent text-right text-[12px] text-[#3B3B3B] placeholder-[#D5D5D5] outline-none"
        />
        <img
          src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/oR4GffMmPR.png"
          width={20}
          height={20}
          alt="search"
        />
      </div>

      {/* عنوان القائمة */}
      <span className="text-[#8E8B8B] text-[14px] mb-3 self-start">
        القائمة الرئيسية
      </span>

      {/* القائمة */}
      <div className="w-full flex flex-col gap-2">
        {links.map((item) => {
          const isActive = pathname === item.path;
          const menuOpen = !!item.children && openMenus[item.name];
          const Icon = item.icon; // ← أهم شيء! هذا SVG Component

          /** عنصر بدون children */
          if (!item.children) {
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex w-full items-center justify-between py-2 px-4 rounded-[13px]
                  ${
                    isActive
                      ? "bg-[rgba(249,178,54,0.15)] text-[#F9B236] font-bold"
                      : "bg-white hover:bg-gray-100 text-[#3B3B3B]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "text-[#F9B236]" : "text-[#3B3B3B]"
                    }`}
                  />
                  <span className="text-[16px] mt-2">{item.name}</span>
                </div>

                <span className="opacity-0">•</span>
              </Link>
            );
          }

          /** عنصر مع children */
          return (
            <div key={item.name} className="w-full flex flex-col">
              <button
                onClick={() => toggle(item.name)}
                className={`flex w-full items-center justify-between py-2 px-4 rounded-[13px]
                ${
                  menuOpen
                    ? "bg-[rgba(249,178,54,0.15)] text-[#F9B236]"
                    : "bg-white hover:bg-gray-100 text-[#3B3B3B]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-6 h-6 ${
                      menuOpen ? "text-[#F9B236]" : "text-[#3B3B3B]"
                    }`}
                  />
                  <span className="text-[16px] mt-2">{item.name}</span>
                </div>

                <img
            src="/icons/downArrow.svg"
            width={16}
            height={16}
            alt="arrow"
            className={`transition-transform ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
              </button>

              {menuOpen && (
                <div className="w-full pr-5 mt-1 flex flex-col gap-1">
                  {item.children!.map((child) => {
                    const activeChild = pathname === child.path;
                    const ChildIcon = child.icon;

                    return (
                      <Link
                        key={child.name}
                        href={child.path}
                        className={`flex items-center justify-between py-2 px-3 rounded-md
                        ${
                          activeChild
                            ? "bg-[rgba(249,178,54,0.15)] text-[#F9B236]"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ChildIcon
                            className={`w-5 h-5 ${
                              activeChild
                                ? "text-[#F9B236]"
                                : "text-[#3B3B3B]"
                            }`}
                          />
                          <span className="text-[15px] mt-2">{child.name}</span>
                        </div>

                        <span className="opacity-0">•</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

   {/* ▪️ الوضع الليلي + تسجيل خروج */}
<div className="mt-auto w-full flex flex-col gap-1">

  {/* Light + Dark Buttons in ONE Container */}
  <div className="grid grid-cols-2 w-full bg-white rounded-[13px] p-1 gap-2">

    {/* Light */}
    <button className="flex items-center justify-center gap-2 py-2 rounded-[10px] bg-[rgba(180,101,255,0.18)] text-[#B465FF] font-semibold">
      <img
        src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/Mio41Eunsu.png"
        width={18}
        height={18}
        alt="light"
      />
      <span className="text-[13px] mt-1">Light</span>
    </button>

    {/* Dark */}
    <button className="flex items-center justify-center gap-2 py-2 rounded-[10px] bg-[#F5F5F5] text-[#9E9E9E] font-semibold">
      <img
        src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/vTFAZ3JmWz.png"
        width={18}
        height={18}
        alt="dark"
      />
      <span className="text-[13px] mt-1">Dark</span>
    </button>

  </div>

  {/* Logout Button — directly under it with NO extra spacing */}
  <button
    onClick={() => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }}
    className="flex items-center justify-center gap-2 w-full bg-[#F5F5F5] py-2 rounded-[13px] text-[#3B3B3B] font-medium"
  >
    <img
      src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/7TDD5oxQoC.png"
      width={20}
      height={20}
      alt="logout"
    />
    <span className="mt-1">تسجيل خروج</span>
  </button>

</div>
    </aside>
  );
}