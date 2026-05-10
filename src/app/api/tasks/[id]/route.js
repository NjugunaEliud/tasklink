import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

// GET /api/tasks/[id]
export async function GET(req, { params }) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, avatar: true, email: true } },
        category: true,
        proposals: {
          include: {
            tasker: { select: { id: true, name: true, avatar: true, skills: true, bio: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        escrow: true,
        review: {
          include: {
            client: { select: { name: true, avatar: true } },
          },
        },
        _count: { select: { proposals: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    // Access control: OPEN tasks are visible to all authenticated users.
    // Non-OPEN tasks are only visible to the client, assigned tasker, or admin.
    const user = session.user;
    if (task.status !== "OPEN") {
      const isClient = task.clientId === user.id;
      const isTasker = task.taskerId === user.id;
      const isAdmin = user.role === "ADMIN";
      if (!isClient && !isTasker && !isAdmin) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error("[TASK GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] — update task status or details
export async function PATCH(req, { params }) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const user = session.user;

    // Only client who owns the task or admin can update status
    if (task.clientId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const allowed = ["title", "description", "status"];
    const updateData = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[TASK PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
