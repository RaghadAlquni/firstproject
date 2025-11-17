"use client";

import React, { useState, useReducer } from "react";
import { useRouter } from "next/navigation";
import {
  authReducer,
  initialAuthState,
  decodeRoleFromToken,
  Role,
} from "@/Reducer/loginReducer";
import { api } from "@/lib/axios";

const Login = () => {
  const router = useRouter();

  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});

  // التحقق من صحة الإدخال
  const validate = () => {
    let newErrors: any = {};

    if (!email.trim()) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    }

    if (!password.trim()) {
      newErrors.password = "يرجى إدخال كلمة المرور";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // إرسال بيانات الدخول
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      dispatch({ type: "LOGIN_REQUEST" });

      const res = await api.post("/login", {
        email: email,
        password,
      });

      const token = res.data.token;

      // حفظ التوكن
      localStorage.setItem("token", token);

      // استخراج الرول من JWT
      const role: Role | null = decodeRoleFromToken(token);

      dispatch({ type: "LOGIN_SUCCESS", payload: token });

      // توجيه حسب الدور
      if (role === "admin") router.push("/dashboard/admin");
      else if (role === "director") router.push("/dashboard/director");
      else if (role === "assistant_director") router.push("/dashboard/assistant-director");
      else if (role === "teacher") router.push("/dashboard/teacher");
      else if (role === "assistant_teacher") router.push("/dashboard/assistant-teacher");
      else if (role === "parent") router.push("/dashboard/parent");
      else alert("لم يتم تحديد نوع المستخدم!");

    } catch (err: any) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.message });
      alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center overflow-hidden px-4 md:px-0">
      
      {/* الصورة */}
      <div className="w-[200px] h-[200px] md:w-[235px] md:h-[235px] bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/AJTRe2kLhY.png')] bg-cover bg-no-repeat mt-4" />

      {/* البوكس */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-[715px] min-h-[380px] bg-[#f5f5f5] rounded-[12px] mt-10 px-[18px] py-[20px] gap-[20px]"
      >
        <span className="text-[20px] md:text-[22px] font-bold text-[#3b3b3b] text-right">
          يرجى تسجيل الدخول للاستمرار
        </span>

        {/* البريد الإلكتروني */}
        <div className="flex flex-col gap-[10px]">
          <label className="text-[16px] font-medium text-[#3b3b3b] text-right">
            البريد الإلكتروني
          </label>

          <input
            type="email"
            className="h-[55px] w-full rounded-[10px] border border-[#f1f1f1] bg-white px-4 text-right text-[16px] font-medium text-[#3b3b3b]"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {errors.email && (
            <p className="text-red-600 text-sm text-right">{errors.email}</p>
          )}
        </div>

        {/* كلمة المرور */}
        <div className="flex flex-col gap-[10px]">
          <label className="text-[16px] font-medium text-[#3b3b3b] text-right">
            كلمة المرور
          </label>

          <input
            type="password"
            className="h-[55px] w-full rounded-[10px] border border-[#f1f1f1] bg-white px-4 text-right text-[16px] font-medium text-[#3b3b3b]"
            placeholder="****"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errors.password && (
            <p className="text-red-600 text-sm text-right">{errors.password}</p>
          )}
        </div>

        {/* زر الدخول */}
        <button
          type="submit"
          className="w-[160px] h-[59px] bg-[#f9b236] text-white rounded-[12px] mx-auto mt-2 shadow-[4px_4px_30px_0_rgba(0,0,0,0.05)] text-[20px] font-medium cursor-pointer"
        >
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
};

export default Login;