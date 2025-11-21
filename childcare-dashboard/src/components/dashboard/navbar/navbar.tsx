"use client";

import { navbarActions } from "@/constants/navbarActions";
import NotificationIcon from "../../../../public/icons/notificationIcon";
import ArrowDownIcon from "../../../../public/icons/downArrow";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useState } from "react";
import Popup from "../popUps/AddPopUp";


const Navbar = () => {
  const { user, role } = useSelector((state: RootState) => state.auth);
  const roleData = navbarActions[role || "admin"];
  // ✨ هنا ستايت البوب أب
  const [openPopup, setOpenPopup] = useState(false);

  
  return (
     <>
      {/* ✨ البوب أب */}
      {openPopup && (
        <Popup open={openPopup} setOpen={setOpenPopup} />
      )}
    <div className="w-full bg-[var(--card)] border-b border-[var(--border)] px-4 md:px-8 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">

        {/* العناوين */}
        <div className="flex flex-col items-start text-right">
          <span className="text-[22px] md:text-[24px] font-bold text-[var(--text)]">
            الرئيسية
          </span>
          <span className="text-[14px] md:text-[16px] text-[var(--text)]">
            {roleData.welcome}
          </span>
        </div>

        {/* القسم الأيسر */}
        <div className="flex flex-row-reverse items-center gap-3 md:gap-4">

          {/* بطاقة الحساب */}
          <div className="group flex items-center gap-3 bg-[var(--bordergray)] border border-[var(--bordergray)] rounded-full px-1 py-1">
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  user?.avatar ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKdfaeaWXW2xTASVlNiMqSMtwYeS7swJT-bg&s"
                })`,
              }}
            />

            <div className="flex flex-col text-right">
              <span className="text-[10px] font-medium text-[var(--text)]">
                {user?.fullName}
              </span>
              <span className="text-[10px] text-[#8e8b8b]">
                {user?.role}
              </span>
            </div>

            <ArrowDownIcon className="w-3 h-3 text-[var(--text)]" />
          </div>

          {/* الإشعارات */}
          <div className="relative border border-[var(--bordergray)] rounded-full p-3">
            <NotificationIcon className="w-5 h-5 text-[var(--text)]" />
            <div className="absolute -top-1 -right-1 bg-[#bf1515] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              <p className="pt-1">3</p>
            </div>
          </div>

          {/* زر حسب دور المستخدم */}
          {roleData.button && (
              <button
                onClick={() => setOpenPopup(true)}
                className="px-4 py-2 bg-[#F9B236] text-white rounded-full cursor-pointer"
              >
               <p className="mt-1"> {roleData.button} </p> 
              </button>
            )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Navbar;
