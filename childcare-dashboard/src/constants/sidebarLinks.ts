import React from "react";
import HomeIcon from "../../public/icons/homeIcon";
import ChildrenIcon from "../../public/icons/childrenIcon";
import StaffIcon from "../../public/icons/staff";
import TeacherIcon from "../../public/icons/teacher"
import AttendanceIcon from "../../public/icons/attendanceIcon";
import BranchIcon from "../../public/icons/branch";
import WalletIcon from "../../public/icons/wallet";
import CalendarIcon from "../../public/icons/calendar";
import ClassRoomIcon from "../../public/icons/classRoom";

//  Types
export interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SidebarItem[];
}

export type SidebarLinksType = {
  [key: string]: SidebarItem[];
};

//  الروابط لكل رول
export const sidebarLinks: SidebarLinksType = {
  admin: [
    { name: "الرئيسية", path: "/dashboard", icon: HomeIcon },

    {
      name: "الأطفال",
      path: "/dashboard/kids",
      icon: ChildrenIcon,
      children: [
        { name: "الأطفال المسجلين", path: "/dashboard/children", icon: ChildrenIcon},
        { name: "قائمة الانتظار", path: "/dashboard/children/waiting", icon: ChildrenIcon },
      ],
    },

    {
      name: "الموظفات",
      path: "/dashboard/staff",
      icon: StaffIcon,
      children: [
        { name: "الإدارة", path: "/dashboard/directors", icon: StaffIcon },
        { name: "الإدارة المساعدة", path: "/dashboard/assistantDirectors", icon: StaffIcon },
        { name: "المساعدات", path: "/dashboard/children/assistant", icon: StaffIcon },
      ],
    },

    {
      name: "الأساتذة",
      path: "/dashboard/teachers",
      icon: TeacherIcon,
      children: [
        { name: "المعلمات الرئيسيات", path: "/dashboard/teachers", icon: TeacherIcon },
        { name: "المعلمات المساعدات", path: "/dashboard/assistantTeachers", icon: TeacherIcon },
      ],
    },

    {
      name: "التحضير",
      path: "/dashboard/attendance",
      icon: AttendanceIcon,
      children: [
        { name: "الأطفال", path: "/dashboard/childrenAttendance", icon: ChildrenIcon },
        { name: "الموظفات", path: "/dashboard/employeeAttendance", icon: StaffIcon },
      ],
    },

    { name: "الفروع", path: "/dashboard/branches", icon: BranchIcon },

    {
      name: "العمليات المالية",
      path: "/dashboard/finance",
      icon: WalletIcon,
      children: [
        { name: "المدفوعات", path: "/dashboard/payments", icon: WalletIcon },
        { name: "المصروفات", path: "/dashboard/expenses", icon: WalletIcon },
      ],
    },

    { name: "التقويم", path: "/dashboard/calendar", icon: CalendarIcon },
  ],

  director: [
    { name: "الرئيسية", path: "/dashboard", icon: HomeIcon },

    {
      name: "الأطفال",
      path: "/dashboard/kids",
      icon: ChildrenIcon,
      children: [
        { name: "الأطفال المسجلين", path: "/dashboard/children", icon: ChildrenIcon },
        { name: "قائمة الانتظار", path: "/dashboard/children/waiting", icon: ChildrenIcon },
      ],
    },

    {
      name: "الموظفات",
      path: "/dashboard/staff",
      icon: StaffIcon,
      children: [
        { name: "الإدارة المساعدة", path: "/dashboard/assistantDirectors", icon: StaffIcon },
        { name: "المساعدات", path: "/dashboard/children/assistant", icon: StaffIcon },
      ],
    },

    {
      name: "الأساتذة",
      path: "/dashboard/teachers",
      icon: TeacherIcon,
      children: [
        { name: "المعلمات الرئيسيات", path: "/dashboard/teachers", icon: TeacherIcon },
        { name: "المعلمات المساعدات", path: "/dashboard/assistantTeachers", icon: TeacherIcon },
      ],
    },

    {
      name: "التحضير",
      path: "/dashboard/attendance",
      icon: AttendanceIcon,
      children: [
        { name: "الأطفال", path: "/dashboard/childrenAttendance", icon: ChildrenIcon },
        { name: "الموظفات", path: "/dashboard/employeeAttendance", icon: StaffIcon },
      ],
    },

    {
      name: "العمليات المالية",
      path: "/dashboard/finance",
      icon: WalletIcon,
      children: [
        { name: "المدفوعات", path: "/dashboard/payments", icon: WalletIcon },
        { name: "المصروفات", path: "/dashboard/expenses", icon: WalletIcon },
      ],
    },

    { name: "التقويم", path: "/dashboard/calendar", icon: CalendarIcon },
  ],

  assistant_director: [
    { name: "الرئيسية", path: "/dashboard", icon: HomeIcon },

    {
      name: "الأطفال",
      path: "/dashboard/kids",
      icon: ChildrenIcon,
      children: [
        { name: "الأطفال المسجلين", path: "/dashboard/children", icon: ChildrenIcon },
        { name: "قائمة الانتظار", path: "/dashboard/children/waiting", icon: ChildrenIcon },
      ],
    },

    {
      name: "الموظفات",
      path: "/dashboard/staff",
      icon: StaffIcon,
      children: [
        { name: "المساعدات", path: "/dashboard/children/assistant", icon: StaffIcon },
      ],
    },

    {
      name: "الأساتذة",
      path: "/dashboard/teachers",
      icon: TeacherIcon,
      children: [
        { name: "المعلمات الرئيسيات", path: "/dashboard/teachers", icon: TeacherIcon },
        { name: "المعلمات المساعدات", path: "/dashboard/assistantTeachers", icon: TeacherIcon },
      ],
    },

    {
      name: "التحضير",
      path: "/dashboard/attendance",
      icon: AttendanceIcon,
      children: [
        { name: "الأطفال", path: "/dashboard/childrenAttendance", icon: ChildrenIcon },
        { name: "الموظفات", path: "/dashboard/employeeAttendance", icon: StaffIcon },
      ],
    },

    { name: "التقويم", path: "/dashboard/calendar", icon: CalendarIcon },
  ],

  teacher: [
    { name: "الرئيسية", path: "/dashboard", icon: HomeIcon },
    { name: "الأطفال", path: "/dashboard/children", icon: ChildrenIcon },
    { name: "التحضير", path: "/dashboard/attendance", icon: AttendanceIcon },
    { name: "الفصول", path: "/dashboard/classes", icon: ClassRoomIcon },
    { name: "التقويم", path: "/dashboard/calendar", icon: CalendarIcon },
  ],
    assistant_teacher: [
        {
            name: "الرئيسية",
            path: "/dashboard",
            icon: HomeIcon,
        },
        {
            name: "الأطفال",
            path: "/dashboard/children",
            icon: ChildrenIcon,
        },
        {
            name: "التحضير",
            path: "/dashboard/attendance",
            icon: AttendanceIcon,
        },
        {
            name: "الفصول",
            path: "/dashboard/classrooms",
            icon: ClassRoomIcon,
        },
        {
            name: "التقويم",
            path: "/dashboard/calendar",
            icon: CalendarIcon,
        },
    ],
};