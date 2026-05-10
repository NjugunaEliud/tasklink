"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Star } from "lucide-react";

export default function ProposalActions({
  proposalId,
  taskId,
  taskBudget,
  showConfirm,
  showReview,
  taskerId,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function acceptProposal() {
    if (!confirm(`Accept this proposal? An M-Pesa STK Push of KES ${taskBudget?.toLocaleString()} will be sent to your phone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Failed to accept proposal.");
      else {
        toast.success("Proposal accepted! Check your M-Pesa for the payment prompt.");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCompletion() {
    if (!confirm("Confirm task completion? This will release the payment to the Tasker.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Failed to confirm.");
      else {
        toast.success(data.message || "Payment released to Tasker!");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, taskerId, taskId }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Failed to submit review.");
      else {
        toast.success("Review submitted!");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 mb-2">Tasker marked this task as complete</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please review the deliverables and confirm completion to release the payment to the Tasker.
        </p>
        <button
          onClick={confirmCompletion}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Confirm Completion & Release Payment
        </button>
      </div>
    );
  }

  if (showReview) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Leave a Review</h2>
        <form onSubmit={submitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${n <= rating ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-400"}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              minLength={10}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="Share your experience with this Tasker..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#1e4d8c] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Review
          </button>
        </form>
      </div>
    );
  }

  // Accept proposal button
  return (
    <div className="mt-3 pl-14">
      <button
        onClick={acceptProposal}
        disabled={loading}
        className="flex items-center gap-2 bg-[#1a3a5c] hover:bg-[#1e4d8c] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Accept Proposal
      </button>
    </div>
  );
}
