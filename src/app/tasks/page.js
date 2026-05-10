import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import TasksClient from "./TasksClient";

export default async function TasksPage({ searchParams }) {
  const session = await auth();
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const categoryId = params.categoryId || "";
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

  const [tasks, total, categories] = await Promise.all([
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
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Check which tasks this tasker has already proposed on
  let proposedTaskIds = [];
  if (session?.user?.role === "TASKER") {
    const myProposals = await prisma.proposal.findMany({
      where: { taskerId: session.user.id },
      select: { taskId: true },
    });
    proposedTaskIds = myProposals.map((p) => p.taskId);
  }

  return (
    <TasksClient
      tasks={tasks}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      categories={categories}
      searchDefault={search}
      categoryDefault={categoryId}
      userRole={session?.user?.role}
      proposedTaskIds={proposedTaskIds}
    />
  );
}
