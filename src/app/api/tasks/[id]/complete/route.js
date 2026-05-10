import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

// POST /api/tasks/[id]/complete — Tasker marks task as done
export async function POST(req, { params }) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const { id } = await params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    if (session.user.role === "TASKER") {
      // Tasker marks complete
      if (task.taskerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
      if (task.status !== "IN_PROGRESS" && task.status !== "ASSIGNED") {
        return NextResponse.json({ error: "Task must be IN_PROGRESS or ASSIGNED to mark complete." }, { status: 409 });
      }
      const updated = await prisma.task.update({
        where: { id },
        data: { status: "PENDING_CONFIRMATION" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  } catch (err) {
    console.error("[TASK COMPLETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
