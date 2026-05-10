"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Search, ChevronLeft, ChevronRight, Loader2, Scale } from "lucide-react";

const statusColors = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  PENDING_CONFIRMATION: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminTasksClient({ tasks, total, page, pages, searchDefault, statusDefault }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchDefault);
  const [status, setStatus] = useState(statusDefault);
  const [loadingId, setLoadingId] = useState(null);

  function applyFilters(overrides = {}) {
    const p = new URLSearchParams();
    const s = overrides.search ?? search;
    const st = overrides.status ?? status;
    if (s) p.set("search", s);
    if (st) p.set("status", st);
    p.set("page", "1");
    startTransition(() => router.push(`/admin/tasks?${p.toString()}`));
  }

  function changePage(pg) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    p.set("page", String(pg));
    startTransition(() => router.push(`/admin/tasks?${p.toString()}`));
  }

  async function resolveDispute(taskId, action) {
    if (!confirm(`${action === "release" ? "Release payment to Tasker" : "Refund Client"}? This is irreversible.`)) return;
    setLoadingId(taskId + action);
    try {
      const res = await fetch(`/api/admin/disputes/${taskId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Failed");
      } else {
        toast.success(action === "release" ? "Payment released." : "Refund issued.");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  }

  const isLoading = (id, act) => loadingId === id + act;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Tasks</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search tasks..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {["OPEN","ASSIGNED","IN_PROGRESS","PENDING_CONFIRMATION","COMPLETED","CANCELLED"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <button
          onClick={() => applyFilters()}
          disabled={isPending}
          className="px-5 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#1e4d8c] transition-colors"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Task</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Budget</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Client → Tasker</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Escrow</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Created</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900 line-clamp-1">{task.title}</div>
                    <div className="text-xs text-gray-400">{task.category?.name}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[task.status] || "bg-gray-100 text-gray-600"}`}>
                      {task.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">
                    KES {task.budget.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {task.client?.name || "—"} → {task.tasker?.name || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {task.escrow ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.escrow.status === "HELD" ? "bg-amber-50 text-amber-700" : task.escrow.status === "RELEASED" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {task.escrow.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">None</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {format(new Date(task.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3.5">
                    {task.escrow?.status === "HELD" && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Release to Tasker"
                          onClick={() => resolveDispute(task.id, "release")}
                          disabled={!!loadingId}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                        >
                          {isLoading(task.id, "release") ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scale className="w-3 h-3" />}
                          Release
                        </button>
                        <button
                          title="Refund Client"
                          onClick={() => resolveDispute(task.id, "refund")}
                          disabled={!!loadingId}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                        >
                          {isLoading(task.id, "refund") ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scale className="w-3 h-3" />}
                          Refund
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-400">{total} tasks total</span>
          <div className="flex items-center gap-2">
            <button onClick={() => changePage(page - 1)} disabled={page <= 1 || isPending} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600">{page} / {pages}</span>
            <button onClick={() => changePage(page + 1)} disabled={page >= pages || isPending} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
