import { jwtDecode } from "jwt-decode";

// 1) نوع الرولز حسب الباك إند
export type Role =
  | "admin"
  | "director"
  | "assistant_director"
  | "teacher"
  | "assistant_teacher"
  | "parent";

// 2) شكل بيانات JWT
interface DecodedToken {
  _id: string;
  fullName: string;
  role: Role;
  shift: string;
  exp: number;
}

// 3) استخراج الرول من التوكن
export function decodeRoleFromToken(token: string): Role | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.role;
  } catch (err) {
    return null;
  }
}

// 4) شكل الستور
export interface AuthState {
  loading: boolean;
  token: string | null;
  role: Role | null;
  error: string | null;
}

// 5) الحالة الابتدائية
export const initialAuthState: AuthState = {
  loading: false,
  token: null,
  role: null,
  error: null,
};

// 6) أنواع الأكشن
export type AuthAction =
  | { type: "LOGIN_REQUEST" }
  | { type: "LOGIN_SUCCESS"; payload: string }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" };

// 7) الرديوسر نفسه
export function authReducer(
  state: AuthState,
  action: AuthAction
): AuthState {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return { ...state, loading: true, error: null };

    case "LOGIN_SUCCESS":
      const role = decodeRoleFromToken(action.payload);
      return {
        ...state,
        loading: false,
        token: action.payload,
        role,
      };

    case "LOGIN_FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "LOGOUT":
      return initialAuthState;

    default:
      return state;
  }
}