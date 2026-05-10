"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, CheckCircle } from "lucide-react";

export default function MarkCompleteButton({ taskId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markComplete() {
    if (!confirm("Mark this task as complete? The client will need to confirm before payment is released.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Failed to mark as complete.");
      else {
        toast.success("Task marked as complete! Awaiting client confirmation.");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={markComplete}
      disabled={loading}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60 w-full justify-center"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
      {loading ? "Submitting..." : "Mark Task as Complete"}
    </button>
  );
}
