import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  budget: z.number().positive(),
  deadline: z.string().min(1),
  categoryId: z.string().min(1),
  attachments: z.array(z.string().url()).default([]),
});

// GET /api/tasks — list OPEN tasks only (Tasker browse)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    const where = {
      status: "OPEN",
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          client: { select: { id: true, name: true, avatar: true } },
          category: true,
          _count: { select: { proposals: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({ tasks, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[TASKS GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tasks — create a task (CLIENT only)
export async function POST(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;
  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can post tasks." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, budget, deadline, categoryId, attachments } = parsed.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        budget,
        deadline: new Date(deadline),
        categoryId,
        attachments,
        clientId: session.user.id,
        status: "OPEN",
      },
      include: { category: true },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("[TASKS POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
