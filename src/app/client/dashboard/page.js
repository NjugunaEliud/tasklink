import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ClipboardList,
  PlusCircle,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  PENDING_CONFIRMATION: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function ClientDashboard() {
  const session = await auth();
  const userId = session.user.id;

  const [tasks, totalSpend, recentTransactions] = await Promise.all([
    prisma.task.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        category: true,
        _count: { select: { proposals: true } },
      },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "ESCROW_IN" },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) =>
      ["ASSIGNED", "IN_PROGRESS", "PENDING_CONFIRMATION"].includes(t.status)
    ).length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    open: tasks.filter((t) => t.status === "OPEN").length,
    spend: totalSpend._sum.amount || 0,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s an overview of your tasks</p>
        </div>
        <Link
          href="/client/post-task"
          className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#1e4d8c] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Post a Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Tasks", value: stats.total, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
          { label: "Active Tasks", value: stats.active, icon: Clock, color: "bg-orange-50 text-orange-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "bg-green-50 text-green-600" },
          { label: "Total Spend", value: `KES ${stats.spend.toLocaleString()}`, icon: DollarSign, color: "bg-purple-50 text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Tasks</h2>
            <Link href="/client/tasks" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {tasks.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No tasks yet. Post your first task!</p>
              </div>
            )}
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/client/tasks/${task.id}`}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[task.status]}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{task.category?.name}</span>
                    <span>·</span>
                    <span>KES {task.budget.toLocaleString()}</span>
                    <span>·</span>
                    <span>{task._count.proposals} proposals</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(task.createdAt))} ago</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Spend History</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">
                No transactions yet.
              </div>
            )}
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {tx.type.replace("_", " ")}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    KES {tx.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDistanceToNow(new Date(tx.createdAt))} ago
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
