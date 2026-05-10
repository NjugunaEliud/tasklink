"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Search,
  DollarSign,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CheckCircle,
  Tag,
  LogIn,
} from "lucide-react";

export default function TasksClient({
  tasks,
  total,
  page,
  pages,
  categories,
  searchDefault,
  categoryDefault,
  userRole,
  proposedTaskIds,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchDefault);
  const [category, setCategory] = useState(categoryDefault);

  function applyFilters(overrides = {}) {
    const params = new URLSearchParams();
    const s = overrides.search ?? search;
    const c = overrides.category ?? category;
    if (s) params.set("search", s);
    if (c) params.set("categoryId", c);
    params.set("page", "1");
    startTransition(() => router.push(`/tasks?${params.toString()}`));
  }

  function changePage(p) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("categoryId", category);
    params.set("page", String(p));
    startTransition(() => router.push(`/tasks?${params.toString()}`));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0d2137] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <Link href="/" className="text-lg font-bold text-white">TaskBridge</Link>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Browse Open Tasks</h1>
          <p className="text-blue-200">
            {total} open task{total !== 1 ? "s" : ""} available
          </p>

          {/* Search */}
          <div className="flex gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-white/10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search tasks..."
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                applyFilters({ category: e.target.value });
              }}
              className="px-4 py-3 rounded-xl bg-white text-gray-700 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              onClick={() => applyFilters()}
              disabled={isPending}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {tasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400">No tasks found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((task) => {
              const hasProposed = proposedTaskIds.includes(task.id);
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                      {task.category?.name}
                    </span>
                    {hasProposed && (
                      <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Applied
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                    {task.description}
                  </p>

                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        KES {task.budget.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Users className="w-3.5 h-3.5" />
                        {task._count.proposals} proposals
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {format(new Date(task.deadline), "MMM d, yyyy")}
                      </div>
                      <span>{formatDistanceToNow(new Date(task.createdAt))} ago</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                        {task.client?.name?.charAt(0)}
                      </div>
                      {task.client?.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page <= 1 || isPending}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => changePage(page + 1)}
              disabled={page >= pages || isPending}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Auth prompt for guests */}
        {!userRole && (
          <div className="mt-8 bg-[#0d2137] rounded-2xl p-6 text-center">
            <p className="text-white font-medium mb-3">
              Want to submit proposals? Create a Tasker account.
            </p>
            <Link
              href="/auth/register?role=TASKER"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Join as Tasker
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
