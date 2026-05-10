"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Clock } from "lucide-react";

export default function ProposalForm({ taskId, taskBudget }) {
  const router = useRouter();
  const [form, setForm] = useState({ message: "", estimatedDuration: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.message.length < 20) {
      toast.error("Proposal message must be at least 20 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, taskId }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Failed to submit proposal.");
      else {
        toast.success("Proposal submitted successfully!");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
        <strong>Fixed budget: KES {taskBudget?.toLocaleString()}</strong> — you cannot change the budget. Provide your best proposal message and estimated delivery time.
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Proposal Message *
        </label>
        <textarea
          required
          minLength={20}
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none text-gray-900"
          placeholder="Explain how you'll approach this task, your relevant experience, and why you're the best fit..."
        />
        <p className="text-xs text-gray-400 mt-1">{form.message.length}/2000 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Estimated Duration *
        </label>
        <div className="relative">
          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            required
            value={form.estimatedDuration}
            onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            placeholder="e.g. 3 days, 1 week, 2 hours"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#1e4d8c] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Submitting..." : "Submit Proposal"}
      </button>
    </form>
  );
}
