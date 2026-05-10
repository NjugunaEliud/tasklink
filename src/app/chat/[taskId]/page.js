import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ChatWindow from "./ChatWindow";

export default async function ChatPage({ params }) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      client: { select: { id: true, name: true, avatar: true, role: true } },
      tasker: { select: { id: true, name: true, avatar: true, role: true } },
    },
  });

  if (!task) notFound();

  const user = session.user;
  const isClient = task.clientId === user.id;
  const isTasker = task.taskerId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isClient && !isTasker && !isAdmin) {
    redirect("/");
  }

  if (!task.taskerId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-400">
        Chat is only available after a Tasker has been assigned.
      </div>
    );
  }

  const messages = await prisma.message.findMany({
    where: { taskId },
    include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  const otherUser = isClient ? task.tasker : task.client;

  return (
    <ChatWindow
      task={task}
      currentUser={{ id: user.id, name: user.name, role: user.role }}
      otherUser={otherUser}
      initialMessages={messages}
    />
  );
}
