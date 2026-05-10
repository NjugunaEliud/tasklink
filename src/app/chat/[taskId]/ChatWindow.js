"use client";
import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { format } from "date-fns";
import { Send, ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ChatWindow({ task, currentUser, otherUser, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const channel = pusher.subscribe(`task-${task.id}`);

    channel.bind("new-message", (data) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [task.id]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input.trim(),
          receiverId: otherUser.id,
          taskId: task.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send message.");
      } else {
        setInput("");
      }
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  const backHref =
    currentUser.role === "CLIENT"
      ? `/client/tasks/${task.id}`
      : `/tasker/tasks/${task.id}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Page top bar */}
      <div className="bg-[#050d1a] border-b-2 border-blue-500/60 px-4 py-3 flex items-center gap-3">
        <Link href={backHref} className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Task
        </Link>
        <span className="text-blue-700">|</span>
        <div className="flex items-center gap-1.5 text-blue-300 text-xs">
          <Briefcase className="w-3.5 h-3.5" />
          <span className="truncate max-w-[200px] sm:max-w-xs">{task.title}</span>
        </div>
        <span className="ml-auto text-blue-400 text-xs font-semibold">KES {task.budget.toLocaleString()}</span>
      </div>

      {/* Centred chat card */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
             style={{ height: "calc(100vh - 140px)", minHeight: "400px", maxHeight: "700px" }}>

          {/* Chat header */}
          <div className="bg-[#0d2137] px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {otherUser?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm">{otherUser?.name}</div>
              <div className="text-blue-400 text-xs">
                {otherUser?.role === "TASKER" ? "Tasker" : "Client"} · Active now
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Online" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-12">
                No messages yet. Say hello!
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end">
                      {msg.sender?.name?.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-[#1a3a5c] text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5 px-1">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                  </div>
                  {isMe && (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end">
                      {currentUser?.name?.charAt(0)}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2 flex-shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-gray-50"
              placeholder="Type a message..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[#1a3a5c] hover:bg-[#1e4d8c] disabled:opacity-50 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
