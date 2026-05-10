"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldOff,
  Shield,
  CheckCircle,
  Trash2,
  Loader2,
} from "lucide-react";

const roleColors = {
  CLIENT: "bg-blue-50 text-blue-700",
  TASKER: "bg-indigo-50 text-indigo-700",
  ADMIN: "bg-purple-50 text-purple-700",
};

export default function AdminUsersClient({ users, total, page, pages, searchDefault, roleDefault }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchDefault);
  const [role, setRole] = useState(roleDefault);
  const [loadingId, setLoadingId] = useState(null);

  function applyFilters(overrides = {}) {
    const p = new URLSearchParams();
    const s = overrides.search ?? search;
    const r = overrides.role ?? role;
    if (s) p.set("search", s);
    if (r) p.set("role", r);
    p.set("page", "1");
    startTransition(() => router.push(`/admin/users?${p.toString()}`));
  }

  function changePage(pg) {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (role) p.set("role", role);
    p.set("page", String(pg));
    startTransition(() => router.push(`/admin/users?${p.toString()}`));
  }

  async function patchUser(id, body, label) {
    setLoadingId(id + label);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Failed");
      } else {
        toast.success("User updated.");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setLoadingId(id + "delete");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Failed");
      } else {
        toast.success("User deleted.");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  }

  const isLoading = (id, action) => loadingId === id + action;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search name or email..."
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); applyFilters({ role: e.target.value }); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="CLIENT">Client</option>
          <option value="TASKER">Tasker</option>
          <option value="ADMIN">Admin</option>
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
                <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Tasks / Proposals</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Joined</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleColors[user.role] || "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${user.suspended ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                        {user.suspended ? "Suspended" : "Active"}
                      </span>
                      {user.verified && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium w-fit bg-blue-50 text-blue-600">Verified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {user._count.tasksPosted} tasks · {user._count.proposals} proposals
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Suspend / Unsuspend */}
                      <button
                        title={user.suspended ? "Unsuspend" : "Suspend"}
                        onClick={() => patchUser(user.id, { suspended: !user.suspended }, "suspend")}
                        disabled={!!loadingId}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-orange-600"
                      >
                        {isLoading(user.id, "suspend")
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : user.suspended
                            ? <Shield className="w-4 h-4" />
                            : <ShieldOff className="w-4 h-4" />}
                      </button>
                      {/* Verify */}
                      {!user.verified && (
                        <button
                          title="Verify user"
                          onClick={() => patchUser(user.id, { verified: true }, "verify")}
                          disabled={!!loadingId}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-green-600"
                        >
                          {isLoading(user.id, "verify")
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCircle className="w-4 h-4" />}
                        </button>
                      )}
                      {/* Delete */}
                      <button
                        title="Delete user"
                        onClick={() => deleteUser(user.id, user.name)}
                        disabled={!!loadingId}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-600"
                      >
                        {isLoading(user.id, "delete")
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-400">{total} users total</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page <= 1 || isPending}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600">{page} / {pages}</span>
            <button
              onClick={() => changePage(page + 1)}
              disabled={page >= pages || isPending}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
