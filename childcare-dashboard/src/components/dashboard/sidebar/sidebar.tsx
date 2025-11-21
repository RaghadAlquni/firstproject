"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiX } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { sidebarLinks, SidebarItem } from "@/constants/sidebarLinks";
import { useTheme } from "@/context/ThemeContext";
import ArrowDownIcon from "../../../../public/icons/downArrow";
import LogoutIcon from"../../../../public/icons/logoutIcon";

const Sidebar = ({ role }: { role: string }) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [isOpen, setIsOpen] = useState(false); // NEW

  const toggle = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const links: SidebarItem[] = sidebarLinks[role] || [];

  return (
    <>

      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 text-3xl text-[#373737]"
      >
        <div className="space-y-1">
          <span className="block w-6 h-[3px] bg-[var(--text)] rounded"></span>
          <span className="block w-6 h-[3px] bg-[var(--text)] rounded"></span>
          <span className="block w-6 h-[3px] bg-[var(--text)] rounded"></span>
        </div>
      </button>

      {/* الـ overlay عند الفتح */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        ></div>
      )}

      {/* السايد بار */}
      <aside
        dir="rtl"
        className={`
          w-[270px]  min-h-screen bg-[var(--card)] border-l border-[var(--border)]
          p-4 pt-6 flex flex-col items-end overflow-y-auto
          z-[9998]

          /* لابتوب */
          md:static md:translate-x-0

          /* موبايل — Drawer */
          fixed top-0 right-0 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >

         {/* زر الإغلاق للجوال فقط */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden text-3xl self-end mb-4 text-[#373737]"
                >
                  <FiX />
                </button>
        {/* اللوجو */}
        <div className="flex w-full items-center gap-3 mb-3 justify-start">
          <img
            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/MAQC2DtLvm.png"
            width={45}
            height={45}
            alt="logo"
          />
          <h1 className="text-[22px] font-bold text-[#F9B236]">واحة المعرفة</h1>
        </div>

        {/* البحث */}
        <div className="w-full flex items-center bg-[var(--card)] border border-[var(--border)] rounded-[13px] py-2 px-3 mb-4 justify-between">
          <input
            type="text"
            placeholder="ابحث عن موظف او طالب او فرع"
            className="flex-1 bg-transparent text-right text-[10px] text-[var(--text)] placeholder-[#D5D5D5] outline-none"
          />
          <img
            src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/oR4GffMmPR.png"
            width={20}
            height={20}
            alt="search"
          />
        </div>

        {/* عنوان القائمة */}
        <span className="text-[var(--text)] opacity-60 text-[14px] mb-3 self-start">
          القائمة الرئيسية
        </span>

        {/* القائمة */}
        <div className="w-full flex flex-col gap-2">
          {links.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            if (!item.children) {
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`group flex w-full items-center justify-between py-2 px-4 rounded-[13px]
                    ${
                      isActive
                        ? "bg-[rgba(249,178,54,0.18)] text-[#F9B236]"
                        : "text-[var(--text)] hover:bg-[rgba(249,178,54,0.18)] hover:text-[#F9B236]"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-6 h-6 ${
                        isActive
                          ? "text-[#F9B236]"
                          : "text-[var(--text)] group-hover:text-[#F9B236]"
                      }`}
                    />
                    <span className="text-[16px] mt-2">{item.name}</span>
                  </div>
                  <span className="opacity-0">•</span>
                </Link>
              );
            }

            const hasChildren = !!item.children;
            const isInThisMenu =
              hasChildren &&
              ((pathname === item.path || pathname.startsWith(item.path)) ||
                item.children!.some(
                  (child) =>
                    pathname === child.path || pathname.startsWith(child.path)
                ));

            const menuOpen =
              hasChildren && (openMenus[item.name] || isInThisMenu);

            return (
              <div key={item.name} className="w-full flex flex-col">
                <button
                  onClick={() => toggle(item.name)}
                  className={` group flex w-full items-center justify-between py-2 px-4 rounded-[13px]
                    ${
                      menuOpen
                        ? "bg-[rgba(249,178,54,0.18)] text-[#F9B236]"
                        : "text-[var(--text)] hover:bg-[rgba(249,178,54,0.18)] hover:text-[#F9B236]"
                    }`}
                >
                  <div className="group flex items-center gap-2">
                    <Icon
                      className={`w-6 h-6 ${
                        menuOpen
                          ? "text-[#F9B236]"
                          : "text-[var(--text)] group-hover:text-[#F9B236]"
                      }`}
                    />
                    <span className="text-[16px] mt-2">{item.name}</span>
                  </div>

                  <ArrowDownIcon
                    className={`transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="w-full pr-5 mt-1 flex flex-col gap-1">
                    {item.children!.map((child) => {
                      const activeChild =
                        pathname === child.path ||
                        pathname.startsWith(child.path);
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.name}
                          href={child.path}
                          className={`flex items-center justify-between py-2 px-3 rounded-[13px]
                            ${
                              activeChild
                                ? "bg-[rgba(249,178,54,0.18)] text-[#F9B236]"
                                : "text-[var(--text)]"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <ChildIcon
                              className={`w-5 h-5 ${
                                activeChild
                                  ? "text-[#F9B236]"
                                  : "text-[var(--text)]"
                              }`}
                            />
                            <span className="text-[15px] mt-2">
                              {child.name}
                            </span>
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

        {/* Light / Dark + Logout */}
        <div className="mt-auto w-full flex flex-col gap-3">
          <div className="grid grid-cols-2 w-full bg-[var(--card)] border border-[var(--border)] rounded-[13px] p-1 gap-2">
            <button
              onClick={() => toggleTheme("light")}
              className={`flex items-center justify-center gap-2 py-2 rounded-[10px] font-semibold text-[13px]
                ${
                  theme === "light"
                    ? "bg-[rgba(249,178,54,0.18)] text-[#F9B236]"
                    : "bg-[#1a1a1a] text-[#C2C2C2]"
                }`}
            >
              Light
            </button>

            <button
              onClick={() => toggleTheme("dark")}
              className={`flex items-center justify-center gap-2 py-2 rounded-[10px] font-semibold text-[13px]
                ${
                  theme === "dark"
                    ? "bg-[rgba(249,178,54,0.18)] text-[#F9B236]"
                    : "bg-[#F5F5F5] text-[#9E9E9E]"
                }`}
            >
              Dark
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="flex items-center justify-center gap-2 w-full bg-[var(--card)] border border-[var(--border)] py-3 rounded-[13px] text-[var(--text)] font-medium"
          >
            <LogoutIcon />
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* خلفية سوداء عند فتح القائمة (موبايل فقط) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-[9997]"
        />
      )}
    </>
  );
};

export default Sidebar;
