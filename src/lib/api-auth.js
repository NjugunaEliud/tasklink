import { auth } from "./auth";
import { NextResponse } from "next/server";

/**
 * Get the current session and enforce authentication on API routes.
 * Returns { session, error } where error is a NextResponse if unauthorized.
 */
export async function requireAuth(req) {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

/**
 * Enforce a specific role on API routes.
 */
export async function requireRole(role) {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (session.user.role !== role) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}
