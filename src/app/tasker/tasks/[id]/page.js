import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { MessageSquare, ArrowRight } from "lucide-react";
import MarkCompleteButton from "./MarkCompleteButton";

const statusColors = {
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  PENDING_CONFIRMATION: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default async function TaskerTaskDetailPage({ params }) {
  const session = await auth();
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      category: true,
      client: { select: { id: true, name: true, avatar: true, email: true } },
      escrow: true,
    },
  });

  if (!task || task.taskerId !== session.user.id) {
    return (
      <div className="p-8 text-center text-gray-400">
        Task not found or you are not assigned to this task.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <span className={`inline-flex text-xs font-medium px-3 py-1 rounded-full mb-3 ${statusColors[task.status] || "bg-gray-100 text-gray-700"}`}>
          {task.status.replace(/_/g, " ")}
        </span>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <Link
            href={`/chat/${task.id}`}
            className="flex items-center gap-2 bg-[#1a3a5c] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1e4d8c] transition-colors flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            Chat with Client
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 text-xs mb-1">Budget (Fixed)</div>
            <div className="font-semibold text-gray-900">KES {task.budget.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Your Payout (95%)</div>
            <div className="font-semibold text-green-600">KES {(task.budget * 0.95).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Deadline</div>
            <div className="font-semibold text-gray-900">{format(new Date(task.deadline), "MMM d, yyyy")}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Category</div>
            <div className="font-semibold text-gray-900">{task.category?.name}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Client</div>
            <div className="font-semibold text-gray-900">{task.client?.name}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Escrow</div>
            <div className={`font-semibold ${task.escrow?.status === "HELD" ? "text-orange-600" : "text-green-600"}`}>
              {task.escrow?.status || "N/A"}
            </div>
          </div>
        </div>

        {(task.status === "ASSIGNED" || task.status === "IN_PROGRESS") && (
          <MarkCompleteButton taskId={task.id} />
        )}

        {task.status === "PENDING_CONFIRMATION" && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-sm text-purple-700">
            <strong>Waiting for client confirmation.</strong> The client will review your work and confirm completion to release your payment.
          </div>
        )}

        {task.status === "COMPLETED" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-sm text-green-700">
            <strong>Task completed!</strong> Your payment of KES {(task.budget * 0.95).toLocaleString()} has been released via M-Pesa.
          </div>
        )}
      </div>
    </div>
  );
}
