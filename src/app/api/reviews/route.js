import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
  taskerId: z.string().min(1),
  taskId: z.string().min(1),
});

// POST /api/reviews
export async function POST(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can leave reviews." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { rating, comment, taskerId, taskId } = parsed.data;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
    if (task.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (task.status !== "COMPLETED") {
      return NextResponse.json({ error: "Reviews can only be left after task completion." }, { status: 409 });
    }

    const existing = await prisma.review.findUnique({ where: { taskId } });
    if (existing) {
      return NextResponse.json({ error: "Review already submitted for this task." }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        clientId: session.user.id,
        taskerId,
        taskId,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("[REVIEWS POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
