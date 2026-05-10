import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  PENDING_CONFIRMATION: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default async function TaskerAssignedTasksPage() {
  const session = await auth();

  const tasks = await prisma.task.findMany({
    where: { taskerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      client: { select: { name: true } },
      escrow: { select: { status: true } },
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Assigned Tasks</h1>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 mb-4">No tasks assigned yet.</p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1e4d8c] transition-colors"
          >
            Browse Open Tasks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[task.status] || "bg-gray-100 text-gray-700"}`}>
                    {task.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{task.category?.name}</span>
                  <span>·</span>
                  <span>KES {task.budget.toLocaleString()}</span>
                  <span>·</span>
                  <span>Client: {task.client?.name}</span>
                  <span>·</span>
                  <span>Escrow: {task.escrow?.status || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/chat/${task.id}`}
                  className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  title="Chat with Client"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <Link
                  href={`/tasker/tasks/${task.id}`}
                  className="flex items-center gap-1.5 bg-[#1a3a5c] text-white text-sm px-3 py-2 rounded-xl hover:bg-[#1e4d8c] transition-colors"
                >
                  View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
