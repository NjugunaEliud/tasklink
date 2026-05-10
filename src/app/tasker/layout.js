import Sidebar from "@/components/Sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TaskerLayout({ children }) {
  const session = await auth();
  if (!session || session.user.role !== "TASKER") redirect("/auth/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="TASKER" userName={session.user.name} />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
