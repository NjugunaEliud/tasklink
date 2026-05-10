import prisma from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const role = params.role || "";
  const limit = 15;
  const skip = (page - 1) * limit;

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        suspended: true,
        verified: true,
        createdAt: true,
        _count: { select: { tasksPosted: true, proposals: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <AdminUsersClient
      users={users}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      searchDefault={search}
      roleDefault={role}
    />
  );
}
