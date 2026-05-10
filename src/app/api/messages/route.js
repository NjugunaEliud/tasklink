import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { pusherServer } from "@/lib/pusher";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  receiverId: z.string().min(1),
  taskId: z.string().min(1),
  fileUrl: z.string().url().optional(),
});

// GET /api/messages?taskId=xxx
export async function GET(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "taskId is required." }, { status: 400 });
  }

  try {
    // Verify user is involved in this task
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const user = session.user;
    if (user.role !== "ADMIN" && task.clientId !== user.id && task.taskerId !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { taskId },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("[MESSAGES GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/messages
export async function POST(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { content, receiverId, taskId, fileUrl } = parsed.data;

    // Verify task and access
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const user = session.user;
    if (task.clientId !== user.id && task.taskerId !== user.id) {
      return NextResponse.json({ error: "Chat is only available for assigned client and tasker." }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        fileUrl,
        senderId: user.id,
        receiverId,
        taskId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Trigger Pusher event
    await pusherServer.trigger(`task-${taskId}`, "new-message", message);

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("[MESSAGES POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
