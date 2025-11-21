export const navbarActions: {
  [key: string]: { button: string | null; welcome: string };
} = {
  admin: {
    button: "إضافة موظفة",
    welcome: "أهلا بكِ في لوحة تحكم واحة المعرفة",
  },
  director: {
    button: "إضافة موظفة",
    welcome: "أهلا بكِ في لوحة تحكم الإدارة",
  },
  assistant_director: {
    button: "إضافة معلمة",
    welcome: "أهلا بكِ في لوحة الإدارة المساعدة",
  },
  teacher: {
    button: null,
    welcome: "أهلا بكِ في لوحة المعلمة",
  },
  assistant_teacher: {
    button: null,
    welcome: "أهلا بكِ في لوحة المساعدة",
  },
};