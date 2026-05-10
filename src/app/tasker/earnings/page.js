import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { DollarSign, TrendingUp, Award, ArrowUpRight } from "lucide-react";

export default async function TaskerEarningsPage() {
  const session = await auth();

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id, type: "ESCROW_OUT" },
    orderBy: { createdAt: "desc" },
    include: { task: { select: { title: true, budget: true } } },
  });

  const totalEarned = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const avgEarning = transactions.length > 0 ? totalEarned / transactions.length : 0;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Earnings</h1>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Total Earned</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">KES {totalEarned.toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">After 5% platform fee</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Completed Tasks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
          <div className="text-xs text-gray-400 mt-1">Paid tasks</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Avg per Task</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">KES {Math.round(avgEarning).toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">Average payout</div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Payment History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No earnings yet. Complete tasks to start earning!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                <div>
              <div className="font-medium text-gray-900 text-sm">{tx.task?.title || "Untitled Task"}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(tx.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                  KES {tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
