import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { initiateSTKPush } from "@/lib/mpesa";

// POST /api/proposals/[id]/accept — Client accepts a proposal
export async function POST(req, { params }) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can accept proposals." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { task: true, tasker: true },
    });

    if (!proposal) return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
    if (proposal.task.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (proposal.task.status !== "OPEN") {
      return NextResponse.json({ error: "Task is not open for acceptance." }, { status: 409 });
    }
    if (proposal.status !== "PENDING") {
      return NextResponse.json({ error: "Proposal is not pending." }, { status: 409 });
    }

    // Get client's phone number
    const client = await prisma.user.findUnique({ where: { id: session.user.id } });

    // Initiate STK Push
    const stkResult = await initiateSTKPush({
      phone: client.phone,
      amount: proposal.task.budget,
      taskId: proposal.task.id,
      accountRef: `TaskBridge-${proposal.task.id.slice(-6)}`,
    });

    // Update proposal, task, and create escrow record in a transaction
    await prisma.$transaction([
      // Accept this proposal
      prisma.proposal.update({
        where: { id },
        data: { status: "ACCEPTED" },
      }),
      // Reject all other proposals for this task
      prisma.proposal.updateMany({
        where: { taskId: proposal.taskId, id: { not: id } },
        data: { status: "REJECTED" },
      }),
      // Update task to ASSIGNED with assigned tasker
      prisma.task.update({
        where: { id: proposal.taskId },
        data: { status: "ASSIGNED", taskerId: proposal.taskerId },
      }),
      // Create escrow record (pending M-Pesa confirmation)
      prisma.escrow.create({
        data: {
          amount: proposal.task.budget,
          status: "HELD",
          mpesaRef: stkResult.CheckoutRequestID || null,
          taskId: proposal.taskId,
          clientId: session.user.id,
          taskerId: proposal.taskerId,
        },
      }),
      // Record the transaction
      prisma.transaction.create({
        data: {
          type: "ESCROW_IN",
          amount: proposal.task.budget,
          mpesaRef: stkResult.CheckoutRequestID || null,
          userId: session.user.id,
          taskId: proposal.taskId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Proposal accepted. M-Pesa STK Push sent to your phone.",
      stkResult,
    });
  } catch (err) {
    console.error("[PROPOSAL ACCEPT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
