import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role="ADMIN" userName={session.user.name} />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
