import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  ClipboardList,
  DollarSign,
  Star,
  ArrowRight,
  Clock,
} from "lucide-react";

const proposalStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function TaskerDashboard() {
  const session = await auth();
  const userId = session.user.id;

  const [proposals, assignedTasks, earnings, reviews] = await Promise.all([
    prisma.proposal.findMany({
      where: { taskerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { task: { include: { category: true } } },
    }),
    prisma.task.findMany({
      where: { taskerId: userId, status: { in: ["ASSIGNED", "IN_PROGRESS", "PENDING_CONFIRMATION"] } },
      orderBy: { updatedAt: "desc" },
      include: { category: true, client: { select: { name: true } } },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "ESCROW_OUT" },
      _sum: { amount: true },
    }),
    prisma.review.findMany({
      where: { taskerId: userId },
      select: { rating: true },
    }),
  ]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  const stats = [
    { label: "Proposals Sent", value: proposals.length, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
    { label: "Active Tasks", value: assignedTasks.length, icon: Briefcase, color: "bg-orange-50 text-orange-600" },
    { label: "Total Earned", value: `KES ${(earnings._sum.amount || 0).toLocaleString()}`, icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: "Avg. Rating", value: avgRating, icon: Star, color: "bg-yellow-50 text-yellow-600" },
  ];

  const taskStatusColors = {
    ASSIGNED: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    PENDING_CONFIRMATION: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your Tasker overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Active Tasks</h2>
            <Link href="/tasker/tasks" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {assignedTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No active tasks. Browse available tasks to submit proposals.
              </div>
            ) : (
              assignedTasks.map((task) => (
                <Link key={task.id} href={`/tasker/tasks/${task.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${taskStatusColors[task.status]}`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Client: {task.client?.name} · KES {task.budget.toLocaleString()}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-100">
            <Link
              href="/tasks"
              className="w-full flex items-center justify-center gap-2 bg-[#1a3a5c] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#1e4d8c] transition-colors"
            >
              Browse Open Tasks
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Proposals</h2>
            <Link href="/tasker/proposals" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {proposals.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                You haven&apos;t submitted any proposals yet.
              </div>
            ) : (
              proposals.map((proposal) => (
                <div key={proposal.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{proposal.task.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{proposal.estimatedDuration}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(proposal.createdAt))} ago</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${proposalStatusColors[proposal.status]}`}>
                      {proposal.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
