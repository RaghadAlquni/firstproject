"use client";

import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  _id: string;
  fullName: string;
  role: string;
  shift: string;
  exp: number;
}

interface AuthState {
  loading: boolean;
  token: string | null;
  role: string | null;
  user: any | null;
  error: string | null;
}

const initialState: AuthState = {
  loading: false,
  token: null,
  role: null,
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.error = null;
    },

    loginSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.token = action.payload;

      try {
        const decoded = jwtDecode<DecodedToken>(action.payload);
        state.role = decoded.role;
        state.user = decoded; // نزود الداتا هنا بدال جلبها من /User
      } catch {
        state.role = null;
        state.user = null;
      }
    },

    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.token = null;
      state.role = null;
      state.user = null;
    },

    logout(state) {
      state.loading = false;
      state.token = null;
      state.role = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
    },

    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;