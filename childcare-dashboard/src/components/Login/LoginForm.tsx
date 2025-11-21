"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
} from "@/redux/authSlice";
import { RootState } from "@/redux/store";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/axios";

interface DecodedToken {
  _id: string;
  fullName: string;
  role: string;
  shift: string;
  exp: number;
}

const Login = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});

  // validate
  const validate = () => {
    let newErrors: any = {};

    if (!email.trim()) newErrors.email = "يرجى إدخال البريد الإلكتروني";
    if (!password.trim()) newErrors.password = "يرجى إدخال كلمة المرور";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      dispatch(loginRequest());

      const res = await api.post("/login", {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);

      dispatch(loginSuccess(token));

      // decode to get role
      const decoded = jwtDecode<DecodedToken>(token);
      const role = decoded.role;

      // redirect based on role
      if (role === "admin") router.push("/dashboard?role=admin");
      else if (role === "director") router.push("/dashboard?role=director");
      else if (role === "teacher") router.push("/dashboard?role=teacher");
      else if (role === "assistant_teacher") router.push("/dashboard?role=assistant_teacher");

    } catch (err: any) {
      dispatch(loginFailure("خطأ في تسجيل الدخول"));
      alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center justify-center overflow-hidden px-4 md:px-0">

      <div className="w-[200px] h-[200px] md:w-[235px] md:h-[235px] bg-[url('https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-11-16/AJTRe2kLhY.png')] bg-cover bg-no-repeat mt-4" />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-[715px] min-h-[380px] bg-[#f5f5f5] rounded-[12px] mt-10 px-[18px] py-[20px] gap-[20px]"
      >
        <span className="text-[20px] md:text-[22px] font-bold text-[#3b3b3b] text-right">
          يرجى تسجيل الدخول للاستمرار
        </span>

        {/* Email */}
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

        {/* Password */}
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

        {/* submit */}
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
