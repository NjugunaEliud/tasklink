import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "TaskBridge — Digital Platform for Client & Tasker Management",
  description:
    "Connect clients with skilled taskers. Post tasks, get proposals, pay securely via M-Pesa.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <SessionProviderWrapper>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1e3a5f",
                color: "#fff",
                borderRadius: "8px",
              },
            }}
          />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
