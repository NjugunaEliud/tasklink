import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

// GET /api/admin/stats
export async function GET(req) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  try {
    const [
      totalUsers,
      totalTasks,
      openTasks,
      completedTasks,
      heldEscrow,
      totalRevenue,
      recentTasks,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: "ADMIN" } } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: "OPEN" } }),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.escrow.aggregate({
        _sum: { amount: true },
        where: { status: "HELD" },
      }),
      prisma.transaction.aggregate({
        _sum: { fee: true },
        where: { type: "PLATFORM_FEE" },
      }),
      prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true } }, category: true },
      }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, role: true } } },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalTasks,
      openTasks,
      completedTasks,
      escrowBalance: heldEscrow._sum.amount || 0,
      platformRevenue: totalRevenue._sum.fee || 0,
      recentTasks,
      recentTransactions,
    });
  } catch (err) {
    console.error("[ADMIN STATS]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
