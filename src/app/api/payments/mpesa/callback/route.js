import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/payments/mpesa/callback — M-Pesa STK Push callback
export async function POST(req) {
  try {
    const body = await req.json();
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
    }

    const { ResultCode, CheckoutRequestID } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful — update task to IN_PROGRESS
      const escrow = await prisma.escrow.findFirst({
        where: { mpesaRef: CheckoutRequestID },
      });

      if (escrow) {
        await prisma.task.update({
          where: { id: escrow.taskId },
          data: { status: "IN_PROGRESS" },
        });
      }
    } else {
      // Payment failed — revert task back to OPEN and remove assignment
      const escrow = await prisma.escrow.findFirst({
        where: { mpesaRef: CheckoutRequestID },
      });

      if (escrow) {
        await prisma.$transaction([
          prisma.task.update({
            where: { id: escrow.taskId },
            data: { status: "OPEN", taskerId: null },
          }),
          prisma.proposal.updateMany({
            where: { taskId: escrow.taskId },
            data: { status: "PENDING" },
          }),
          prisma.escrow.delete({ where: { id: escrow.id } }),
        ]);
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (err) {
    console.error("[MPESA CALLBACK]", err);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Failed" });
  }
}
