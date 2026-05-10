import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

// GET /api/categories
export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

// POST /api/categories — Admin only
export async function POST(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json();
  const { name, icon } = body;
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const category = await prisma.category.create({ data: { name, icon: icon || "briefcase" } });
  return NextResponse.json(category, { status: 201 });
}
