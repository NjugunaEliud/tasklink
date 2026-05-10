import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { DollarSign, Calendar, Users, Tag, ArrowLeft, User } from "lucide-react";
import ProposalForm from "./ProposalForm";

export default async function TaskDetailPage({ params }) {
  const session = await auth();
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id, status: "OPEN" },
    include: {
      client: { select: { id: true, name: true, avatar: true, createdAt: true } },
      category: true,
      _count: { select: { proposals: true } },
    },
  });

  if (!task) notFound();

  // Check if this tasker already submitted a proposal
  let existingProposal = null;
  if (session?.user?.role === "TASKER") {
    existingProposal = await prisma.proposal.findFirst({
      where: { taskId: id, taskerId: session.user.id },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-[#0d2137] py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            href="/tasks"
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
                  {task.category?.name}
                </span>
                <span className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1 rounded-full">
                  OPEN
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Proposal Form */}
            {session?.user?.role === "TASKER" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Submit a Proposal</h2>
                {existingProposal ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                    ✅ You&apos;ve already submitted a proposal for this task.
                    Status: <strong>{existingProposal.status}</strong>
                  </div>
                ) : (
                  <ProposalForm taskId={task.id} taskBudget={task.budget} />
                )}
              </div>
            )}

            {!session && (
              <div className="bg-[#0d2137] rounded-2xl p-6 text-center">
                <p className="text-white font-medium mb-3">
                  Sign in as a Tasker to submit a proposal.
                </p>
                <Link
                  href={`/auth/login?callbackUrl=/tasks/${task.id}`}
                  className="inline-flex bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {session?.user?.role === "CLIENT" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                This task was posted by a client. Switch to a Tasker account to submit proposals.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Task Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Fixed Budget</div>
                  <div className="font-bold text-gray-900">KES {task.budget.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Deadline</div>
                  <div className="font-bold text-gray-900">{format(new Date(task.deadline), "MMM d, yyyy")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Proposals</div>
                  <div className="font-bold text-gray-900">{task._count.proposals}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Posted</div>
                  <div className="font-bold text-gray-900">{formatDistanceToNow(new Date(task.createdAt))} ago</div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">About the Client</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white font-bold">
                  {task.client?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{task.client?.name}</div>
                  <div className="text-xs text-gray-400">
                    Member since {format(new Date(task.client?.createdAt), "MMM yyyy")}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 leading-relaxed">
              <strong>Fixed Budget Policy:</strong> The budget of KES {task.budget.toLocaleString()} is set by the client and cannot be negotiated. Your proposal should include a delivery message and estimated duration only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
