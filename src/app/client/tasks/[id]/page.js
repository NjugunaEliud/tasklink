import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import ProposalActions from "./ProposalActions";
import {
  Calendar,
  DollarSign,
  Tag,
  Clock,
  MessageSquare,
  Star,
  CheckCircle,
  User,
} from "lucide-react";

const statusColors = {
  OPEN: "bg-blue-100 text-blue-700 border-blue-200",
  ASSIGNED: "bg-yellow-100 text-yellow-700 border-yellow-200",
  IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
  PENDING_CONFIRMATION: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default async function ClientTaskDetailPage({ params }) {
  const session = await auth();
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      category: true,
      proposals: {
        include: {
          tasker: { select: { id: true, name: true, avatar: true, skills: true, bio: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      escrow: true,
      review: true,
      tasker: { select: { id: true, name: true, avatar: true } },
    },
  });

  if (!task || task.clientId !== session.user.id) notFound();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border mb-3 ${statusColors[task.status]}`}>
              {task.status.replace(/_/g, " ")}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          </div>
          {(task.status === "ASSIGNED" || task.status === "IN_PROGRESS" || task.status === "PENDING_CONFIRMATION" || task.status === "COMPLETED") && task.taskerId && (
            <Link
              href={`/chat/${task.id}`}
              className="flex items-center gap-2 bg-[#1a3a5c] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1e4d8c] transition-colors flex-shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              Chat with Tasker
            </Link>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Proposals */}
          {task.status === "OPEN" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">
                  Proposals ({task.proposals.length})
                </h2>
              </div>
              {task.proposals.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No proposals yet. Taskers will start bidding soon.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {task.proposals.map((proposal) => (
                    <div key={proposal.id} className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {proposal.tasker.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-gray-900">{proposal.tasker.name}</span>
                            <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(proposal.createdAt))} ago</span>
                          </div>
                          {proposal.tasker.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {proposal.tasker.skills.slice(0, 3).map((s) => (
                                <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mb-2 leading-relaxed">{proposal.message}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Duration: {proposal.estimatedDuration}</span>
                          </div>
                        </div>
                      </div>
                      <ProposalActions proposalId={proposal.id} taskId={task.id} taskBudget={task.budget} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assigned Tasker Info */}
          {task.tasker && task.status !== "OPEN" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Assigned Tasker</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white font-bold">
                  {task.tasker.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{task.tasker.name}</div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Completion */}
          {task.status === "PENDING_CONFIRMATION" && (
            <ProposalActions taskId={task.id} showConfirm />
          )}

          {/* Leave Review */}
          {task.status === "COMPLETED" && !task.review && task.taskerId && (
            <ProposalActions taskId={task.id} taskerId={task.taskerId} showReview />
          )}

          {task.review && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-gray-900">Your Review</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < task.review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">{task.review.comment}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <div className="text-gray-400 text-xs">Budget</div>
                <div className="font-semibold text-gray-900">KES {task.budget.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <div className="text-gray-400 text-xs">Deadline</div>
                <div className="font-semibold text-gray-900">{format(new Date(task.deadline), "MMM d, yyyy")}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Tag className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <div className="text-gray-400 text-xs">Category</div>
                <div className="font-semibold text-gray-900">{task.category?.name}</div>
              </div>
            </div>
          </div>

          {/* Escrow info */}
          {task.escrow && (
            <div className={`rounded-2xl border p-5 ${task.escrow.status === "HELD" ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">
                Escrow Status
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${task.escrow.status === "RELEASED" ? "text-green-500" : "text-orange-500"}`} />
                <span className="font-medium text-sm">{task.escrow.status}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">KES {task.escrow.amount.toLocaleString()} held</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
