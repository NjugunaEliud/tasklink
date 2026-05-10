import prisma from "@/lib/prisma";
import AdminTasksClient from "./AdminTasksClient";

export default async function AdminTasksPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const status = params.status || "";
  const limit = 15;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
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
        client: { select: { name: true } },
        tasker: { select: { name: true } },
        category: true,
        escrow: { select: { id: true, status: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return (
    <AdminTasksClient
      tasks={tasks}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      searchDefault={search}
      statusDefault={status}
    />
  );
}
