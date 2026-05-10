import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock } from "lucide-react";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function TaskerProposalsPage() {
  const session = await auth();

  const proposals = await prisma.proposal.findMany({
    where: { taskerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      task: {
        include: { category: true, client: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Proposals</h1>

      {proposals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">You haven&apos;t submitted any proposals yet.</p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 mt-4 bg-[#1a3a5c] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1e4d8c] transition-colors"
          >
            Browse Tasks
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {proposal.task.title}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[proposal.status]}`}
                    >
                      {proposal.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span>{proposal.task.category?.name}</span>
                    <span>·</span>
                    <span>KES {proposal.task.budget.toLocaleString()} (fixed budget)</span>
                    <span>·</span>
                    <span>Client: {proposal.task.client?.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{proposal.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Est. duration: {proposal.estimatedDuration}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(proposal.createdAt))} ago</span>
                  </div>
                </div>
                {proposal.status === "ACCEPTED" && (
                  <Link
                    href={`/tasker/tasks/${proposal.task.id}`}
                    className="flex items-center gap-1.5 bg-[#1a3a5c] text-white text-sm px-3 py-2 rounded-xl hover:bg-[#1e4d8c] transition-colors flex-shrink-0"
                  >
                    View Task <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
