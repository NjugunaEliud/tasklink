import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const txColors = {
  ESCROW_IN: { bg: "bg-blue-50", text: "text-blue-700", icon: ArrowDownLeft },
  ESCROW_OUT: { bg: "bg-green-50", text: "text-green-700", icon: ArrowUpRight },
  PLATFORM_FEE: { bg: "bg-purple-50", text: "text-purple-700", icon: TrendingUp },
  REFUND: { bg: "bg-red-50", text: "text-red-700", icon: ArrowUpRight },
};

export default async function AdminTransactionsPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const type = params.type || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = type ? { type } : {};

  const [transactions, total, totals] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        task: { select: { title: true } },
        user: { select: { name: true, role: true } },
      },
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
    }),
  ]);

  const pages = Math.ceil(total / limit);
  const totalByType = Object.fromEntries(
    totals.map((t) => [t.type, t._sum.amount || 0])
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h1>

      {/* Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {["ESCROW_IN", "ESCROW_OUT", "PLATFORM_FEE", "REFUND"].map((t) => {
          const cfg = txColors[t] || { bg: "bg-gray-50", text: "text-gray-700", icon: DollarSign };
          const Icon = cfg.icon;
          return (
            <div key={t} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${cfg.text}`} />
              </div>
              <div className="text-xs text-gray-400 mb-1">{t.replace(/_/g, " ")}</div>
              <div className="font-bold text-gray-900">KES {(totalByType[t] || 0).toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <form method="get" className="flex gap-3 mb-5">
        <select name="type" defaultValue={type} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          {["ESCROW_IN","ESCROW_OUT","PLATFORM_FEE","REFUND"].map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
          ))}
        </select>
        <button type="submit" className="px-5 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#1e4d8c] transition-colors">
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Task</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const cfg = txColors[tx.type] || { bg: "bg-gray-50", text: "text-gray-700" };
                return (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
                        {tx.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      KES {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {tx.user?.name || "—"}
                      <span className="ml-1 text-xs text-gray-400">({tx.user?.role})</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 truncate max-w-48">
                      {tx.task?.title || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {format(new Date(tx.createdAt), "MMM d, yyyy · h:mm a")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-400">{total} transactions</span>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/admin/transactions?type=${type}&page=${p}`}
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${p === page ? "bg-[#1a3a5c] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-100"}`}
              >
                {p}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
