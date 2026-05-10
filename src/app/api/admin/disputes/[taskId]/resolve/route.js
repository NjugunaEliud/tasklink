import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

// POST /api/admin/disputes/[taskId]/resolve
export async function POST(req, { params }) {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  const { taskId } = await params;

  try {
    const body = await req.json();
    const { action } = body; // "release" | "refund"

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { escrow: true },
    });

    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
    if (!task.escrow || task.escrow.status !== "HELD") {
      return NextResponse.json({ error: "No held escrow for this task." }, { status: 409 });
    }

    if (action === "release") {
      await prisma.$transaction([
        prisma.task.update({ where: { id: taskId }, data: { status: "COMPLETED" } }),
        prisma.escrow.update({ where: { taskId }, data: { status: "RELEASED" } }),
        prisma.transaction.create({
          data: {
            type: "ESCROW_OUT",
            amount: task.escrow.amount * 0.95,
            fee: task.escrow.amount * 0.05,
            userId: task.taskerId,
            taskId,
          },
        }),
      ]);
      return NextResponse.json({ success: true, action: "released" });
    }

    if (action === "refund") {
      await prisma.$transaction([
        prisma.task.update({ where: { id: taskId }, data: { status: "CANCELLED" } }),
        prisma.escrow.update({ where: { taskId }, data: { status: "REFUNDED" } }),
        prisma.transaction.create({
          data: {
            type: "REFUND",
            amount: task.escrow.amount,
            userId: task.clientId,
            taskId,
          },
        }),
      ]);
      return NextResponse.json({ success: true, action: "refunded" });
    }

    return NextResponse.json({ error: "Invalid action. Use 'release' or 'refund'." }, { status: 400 });
  } catch (err) {
    console.error("[ADMIN DISPUTE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
