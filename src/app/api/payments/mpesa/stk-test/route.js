import { NextResponse } from "next/server";
import { initiateSTKPush } from "@/lib/mpesa";

/**
 * POST /api/payments/mpesa/stk-test
 * Development/testing endpoint — trigger an STK push directly.
 * Only usable when MPESA_TEST_SECRET matches the x-test-secret header.
 *
 * Body: { phone, amount, accountRef? }
 */
export async function POST(req) {
  // Simple shared-secret guard so this can't be called anonymously in production
  const secret = req.headers.get("x-test-secret");
  if (!secret || secret !== process.env.MPESA_TEST_SECRET) {
    return NextResponse.json({ error: "Forbidden: missing or invalid x-test-secret" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { phone, amount, accountRef } = body;

  if (!phone || !amount) {
    return NextResponse.json(
      { error: "phone and amount are required" },
      { status: 400 }
    );
  }

  try {
    const result = await initiateSTKPush({
      phone,
      amount: Number(amount),
      taskId: "test-task-id",
      accountRef: accountRef || "TestPayment",
    });

    return NextResponse.json({ success: true, mpesa: result });
  } catch (err) {
    const mpesaError = err?.response?.data || err?.message || "Unknown error";
    return NextResponse.json(
      { success: false, error: mpesaError },
      { status: 502 }
    );
  }
}
