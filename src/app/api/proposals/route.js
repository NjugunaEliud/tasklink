import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const proposalSchema = z.object({
  message: z.string().min(20).max(2000),
  estimatedDuration: z.string().min(1).max(100),
  taskId: z.string().min(1),
});

// GET /api/proposals?taskId=xxx — get proposals for a task (Client or Admin)
export async function GET(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  const taskerId = searchParams.get("taskerId");

  try {
    const where = {};
    if (taskId) where.taskId = taskId;
    if (taskerId) where.taskerId = taskerId;

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        tasker: { select: { id: true, name: true, avatar: true, skills: true, bio: true } },
        task: { select: { id: true, title: true, budget: true, status: true, clientId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter: tasker can only see their own proposals
    const user = session.user;
    if (user.role === "TASKER") {
      return NextResponse.json(proposals.filter((p) => p.taskerId === user.id));
    }

    return NextResponse.json(proposals);
  } catch (err) {
    console.error("[PROPOSALS GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/proposals — Tasker submits proposal
export async function POST(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  if (session.user.role !== "TASKER") {
    return NextResponse.json({ error: "Only taskers can submit proposals." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = proposalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { message, estimatedDuration, taskId } = parsed.data;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
    if (task.status !== "OPEN") {
      return NextResponse.json({ error: "This task is no longer accepting proposals." }, { status: 409 });
    }

    // Check if already submitted
    const existing = await prisma.proposal.findFirst({
      where: { taskId, taskerId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already submitted a proposal for this task." }, { status: 409 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        message,
        estimatedDuration,
        taskId,
        taskerId: session.user.id,
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (err) {
    console.error("[PROPOSALS POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
