import prisma from "@/lib/prisma";
import { format } from "date-fns";
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";

const statusColors = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  PENDING_CONFIRMATION: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const txColors = {
  ESCROW_IN: "bg-blue-50 text-blue-700",
  ESCROW_OUT: "bg-green-50 text-green-700",
  PLATFORM_FEE: "bg-purple-50 text-purple-700",
  REFUND: "bg-red-50 text-red-700",
};

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalClients,
    totalTaskers,
    totalTasks,
    openTasks,
    completedTasks,
    escrowAgg,
    feeAgg,
    recentTasks,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "TASKER" } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: "OPEN" } }),
    prisma.task.count({ where: { status: "COMPLETED" } }),
    prisma.escrow.aggregate({ where: { status: "HELD" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "PLATFORM_FEE" }, _sum: { amount: true } }),
    prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      include: { client: { select: { name: true } }, category: true },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      include: { task: { select: { title: true } }, user: { select: { name: true } } },
    }),
  ]);

  const escrowBalance = escrowAgg._sum.amount || 0;
  const platformRevenue = feeAgg._sum.amount || 0;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, sub: `${totalClients} clients · ${totalTaskers} taskers`, color: "from-blue-500 to-blue-600" },
    { label: "Total Tasks", value: totalTasks, icon: Briefcase, sub: `${openTasks} open · ${completedTasks} completed`, color: "from-indigo-500 to-indigo-600" },
    { label: "Escrow Held", value: `KES ${escrowBalance.toLocaleString()}`, icon: DollarSign, sub: "Awaiting release", color: "from-amber-500 to-amber-600" },
    { label: "Platform Revenue", value: `KES ${platformRevenue.toLocaleString()}`, icon: TrendingUp, sub: "5% fee collected", color: "from-green-500 to-green-600" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Recent Tasks
          </h2>
          <div className="space-y-3">
            {recentTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-900 truncate">{t.title}</div>
                  <div className="text-xs text-gray-400">
                    {t.client?.name} · {t.category?.name} · KES {t.budget.toLocaleString()}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ml-3 flex-shrink-0 ${statusColors[t.status] || "bg-gray-100 text-gray-600"}`}>
                  {t.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-900 truncate">{tx.task?.title || "—"}</div>
                  <div className="text-xs text-gray-400">
                    {tx.user?.name} · {format(new Date(tx.createdAt), "MMM d, h:mm a")}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${txColors[tx.type] || "bg-gray-100 text-gray-600"}`}>
                    {tx.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    KES {tx.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
