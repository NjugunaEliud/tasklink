import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

// PATCH /api/admin/users/[id] — suspend, verify, or delete a user
export async function PATCH(req, { params }) {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const { suspended, verified } = body;

    const updateData = {};
    if (suspended !== undefined) updateData.suspended = suspended;
    if (verified !== undefined) updateData.verified = verified;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, suspended: true, verified: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("[ADMIN USER PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(req, { params }) {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN USER DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
