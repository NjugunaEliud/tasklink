import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  portfolio: z.string().url().optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
});

export async function GET(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, phone: true,
      bio: true, skills: true, portfolio: true, avatar: true, role: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([_, v]) => v !== undefined)
  );

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user });
}
