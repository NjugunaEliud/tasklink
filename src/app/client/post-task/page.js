"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Upload, Calendar, DollarSign, Tag } from "lucide-react";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  deadline: z.string().min(1, "Deadline is required"),
  categoryId: z.string().min(1, "Please select a category"),
});

export default function PostTaskPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function onSubmit(data) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        budget: Number(data.budget),
        deadline: new Date(data.deadline).toISOString(),
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to post task.");
      } else {
        toast.success("Task posted successfully!");
        router.push(`/client/tasks/${result.id}`);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Task</h1>
        <p className="text-gray-500 mt-1">
          Describe your task clearly to attract the best Taskers.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            Task Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Task Title *
            </label>
            <input
              {...register("title")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="e.g. Build a React landing page for my startup"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description *
            </label>
            <textarea
              {...register("description")}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 resize-none"
              placeholder="Describe your task in detail — requirements, tech stack, deliverables, etc."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category *
            </label>
            <select
              {...register("categoryId")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>
        </div>

        {/* Budget & Deadline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Budget & Deadline
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fixed Budget (KES) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  KES
                </span>
                <input
                  {...register("budget")}
                  type="number"
                  min="1"
                  step="1"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  placeholder="5000"
                />
              </div>
              {errors.budget && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.budget.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                This is fixed — Taskers cannot counter-offer.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Deadline *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register("deadline")}
                  type="date"
                  min={todayStr}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              {errors.deadline && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.deadline.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Platform notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <strong>Payment notice:</strong> When you accept a proposal, an M-Pesa STK Push will be sent to your registered phone. Funds are held in escrow until you confirm task completion. A 5% platform fee is deducted from the Tasker&apos;s payout only.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a3a5c] hover:bg-[#1e4d8c] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Posting task..." : "Post Task"}
        </button>
      </form>
    </div>
  );
}
