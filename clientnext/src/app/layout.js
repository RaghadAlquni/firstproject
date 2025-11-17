import "./globals.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "واحة المعرفة",
  description: "مركز واحة المعرفة لضيافة الأطفال",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans bg-white text-[#282828]">
      <Toaster
  position="top-center"
  toastOptions={{
    className: "Toastify--center",
    style: {
      background: "#fff",
      fontSize: "18px",
      padding: "16px 24px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      fontFamily: "inherit",
    },
  }}
/>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}