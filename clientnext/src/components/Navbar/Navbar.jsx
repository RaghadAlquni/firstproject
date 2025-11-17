"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "../../../public/wmLogo.png";
import Link from "next/link";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);



  return (
    <header
      className="bg-white py-3 px-6 md:px-12 shadow-sm flex justify-between items-center w-full"
      dir="rtl"
    >
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src={logo}
          alt="واحة المعرفة"
          width={90}
          height={90}
          className="object-contain"
        />
      </div>

      {/* Navigation Links */}
      <nav className="hidden lg:flex items-center gap-20 font-bold text-[18px]">
        <Link href="/#Home" className="text-[#F9B236] hover:opacity-80 transition">
          الرئيسية
        </Link>
        <Link href="/#About" className="text-[#292929] hover:text-[#F9B236] transition">
          من نحن؟
        </Link>
        <Link href="/#Servive" className="text-[#292929] hover:text-[#F9B236] transition">
          الخدمات
        </Link>
        <Link href="/#Brnach" className="text-[#292929] hover:text-[#F9B236] transition">
          الفروع
        </Link>
        <Link href="/#Events" className="text-[#292929] hover:text-[#F9B236] transition">
          أخبارنا
        </Link>
        <Link href="/career" className="text-[#292929] hover:text-[#F9B236] transition">
          التوظيف
        </Link>
      </nav>

      {/* Buttons */}
      <div className="hidden md:flex items-center gap-4">
        <button className="flex items-center gap-2 border border-[#F9B236] text-[#F9B236] bg-white rounded-full py-[8px] px-[20px] font-bold hover:bg-[#FFF8E5] transition">
          English
        </button>
        <button className="bg-[#F9B236] text-white rounded-full py-[8px] px-[20px] font-bold hover:opacity-90 transition">
          تواصل معنا
        </button>
      </div>

      {/* Mobile Menu Icon */}
      <div
        className="flex flex-col justify-between w-[28px] h-[22px] cursor-pointer lg:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span
          className={`h-[3px] bg-[#292929] rounded-md transition-transform duration-300 ${
            menuOpen ? "rotate-45 translate-y-[8px]" : ""
          }`}
        ></span>
        <span
          className={`h-[3px] bg-[#292929] rounded-md transition-opacity duration-300 ${
            menuOpen ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`h-[3px] bg-[#292929] rounded-md transition-transform duration-300 ${
            menuOpen ? "-rotate-45 -translate-y-[8px]" : ""
          }`}
        ></span>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 w-[260px] h-full bg-white shadow-2xl flex flex-col items-center pt-24 gap-6 text-[18px] font-bold transition-transform duration-500 ease-in-out z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <a href="#" className="text-[#F9B236]" onClick={() => setMenuOpen(false)}>
          الرئيسية
        </a>
        <a href="#" className="text-[#292929]" onClick={() => setMenuOpen(false)}>
          من نحن؟
        </a>
        <a href="#" className="text-[#292929]" onClick={() => setMenuOpen(false)}>
          الخدمات
        </a>
        <a href="#" className="text-[#292929]" onClick={() => setMenuOpen(false)}>
          الفروع
        </a>
        <a href="#" className="text-[#292929]" onClick={() => setMenuOpen(false)}>
          أخبارنا
        </a>
        <a href="#" className="text-[#292929]" onClick={() => setMenuOpen(false)}>
          التوظيف
        </a>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button className="bg-[#F9B236] text-white rounded-full py-[8px] px-[20px] font-bold">
            تواصل معنا
          </button>
          <button className="flex items-center gap-2 border border-[#F9B236] text-[#F9B236] bg-white rounded-full py-[8px] px-[20px] font-bold hover:bg-[#FFF8E5] transition">
            English
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;