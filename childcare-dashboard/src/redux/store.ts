"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// types مهمه لسهولة الاستخدام
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
