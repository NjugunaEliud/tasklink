import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { sendB2CPayment } from "@/lib/mpesa";

const PLATFORM_FEE = 0.05;

// POST /api/tasks/[id]/confirm — Client confirms task completion & releases payment
export async function POST(req, { params }) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can confirm completion." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { escrow: true },
    });

    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
    if (task.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (task.status !== "PENDING_CONFIRMATION") {
      return NextResponse.json({ error: "Task is not pending confirmation." }, { status: 409 });
    }
    if (!task.escrow || task.escrow.status !== "HELD") {
      return NextResponse.json({ error: "Escrow is not in HELD state." }, { status: 409 });
    }

    // Get tasker's phone
    const tasker = await prisma.user.findUnique({ where: { id: task.taskerId } });

    const totalAmount = task.escrow.amount;
    const fee = totalAmount * PLATFORM_FEE;
    const payoutAmount = totalAmount - fee;

    // Attempt B2C payment — non-blocking (sandbox may not support B2C)
    let b2cResult = null;
    let b2cFailed = false;
    try {
      b2cResult = await sendB2CPayment({
        phone: tasker.phone,
        amount: payoutAmount,
        taskId: task.id,
      });
    } catch (b2cErr) {
      console.warn("[B2C SKIPPED]", b2cErr?.response?.data?.errorMessage || b2cErr.message);
      b2cFailed = true;
    }

    // Update records regardless of B2C outcome
    await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: { status: "COMPLETED" },
      }),
      prisma.escrow.update({
        where: { taskId: id },
        data: {
          status: "RELEASED",
          mpesaRef: b2cResult?.ConversationID || task.escrow.mpesaRef,
        },
      }),
      // Platform fee transaction
      prisma.transaction.create({
        data: {
          type: "PLATFORM_FEE",
          amount: fee,
          fee,
          userId: task.clientId,
          taskId: task.id,
        },
      }),
      // Payout transaction
      prisma.transaction.create({
        data: {
          type: "ESCROW_OUT",
          amount: payoutAmount,
          fee,
          mpesaRef: b2cResult?.ConversationID || null,
          userId: task.taskerId,
          taskId: task.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: b2cFailed
        ? `Task completed! Payout of KES ${payoutAmount.toFixed(2)} will be processed manually.`
        : `Payment of KES ${payoutAmount.toFixed(2)} sent to tasker via M-Pesa.`,
      b2cResult,
    });
  } catch (err) {
    console.error("[TASK CONFIRM]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
