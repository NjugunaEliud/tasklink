import Sidebar from "@/components/Sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TaskerTasksLayout({ children }) {
  const session = await auth();
  if (!session || session.user.role !== "TASKER") redirect("/auth/login");
  return children;
}
