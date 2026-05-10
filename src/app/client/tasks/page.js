import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ClipboardList, ArrowRight, PlusCircle } from "lucide-react";

const statusColors = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  PENDING_CONFIRMATION: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function ClientTasksPage() {
  const session = await auth();

  const tasks = await prisma.task.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { proposals: true } },
      tasker: { select: { id: true, name: true, avatar: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <Link
          href="/client/post-task"
          className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#1e4d8c] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Post a Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-semibold text-gray-700 mb-2">No tasks yet</h3>
          <p className="text-gray-400 text-sm mb-6">Post your first task and start getting proposals.</p>
          <Link
            href="/client/post-task"
            className="inline-flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1e4d8c] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Post a Task
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/client/tasks/${task.id}`}
              className="flex items-center gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-blue-200 transition-all card-hover"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[task.status]}`}>
                    {task.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md">{task.category?.name}</span>
                  <span>KES {task.budget.toLocaleString()}</span>
                  <span>{task._count.proposals} proposals</span>
                  {task.tasker && <span>Tasker: {task.tasker.name}</span>}
                  <span>{formatDistanceToNow(new Date(task.createdAt))} ago</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
