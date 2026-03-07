"use client";
import { useState, useEffect, useRef } from "react";
import { pusherClient } from "@/lib/pusher";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderType: string;
  senderName: string;
  createdAt: string | Date;
}

interface Props {
  leadId: string; // lead.id (cuid) for API calls
  leadDbId: string; // same — lead.id
  senderName: string; // logged in user's name
}

export function LeadChat({ leadId, senderName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch message history
  useEffect(() => {
    fetch(`/api/chat/messages?leadId=${leadId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [leadId]);

  // Subscribe to Pusher channel
  useEffect(() => {
    const channel = pusherClient.subscribe(`lead-${leadId}`);
    channel.bind("new-message", (data: Message) => {
      if (!data?.senderType) return;
      setMessages((prev) => {
        const safe = prev.filter((m) => m?.senderType);
        // Already exists (real message)
        if (safe.find((m) => m.id === data.id)) return safe;
        // Replace matching temp message
        const tempIdx = safe.findIndex(
          (m) => m.id.startsWith("temp-") &&
            m.content === data.content &&
            m.senderName === data.senderName
        );
        if (tempIdx !== -1) {
          const next = [...safe];
          next[tempIdx] = data;
          return next;
        }
        return [...safe, data];
      });
    });
    return () => { pusherClient.unsubscribe(`lead-${leadId}`); };
  }, [leadId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content: input.trim(),
      senderType: "TEAM",
      senderName,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev.filter((m) => m?.senderType), tempMessage]);
    const sentContent = input.trim();
    setInput("");

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, content: sentContent, senderType: "TEAM", senderName }),
      });
      const data = await res.json();
      if (data.message) {
        // Replace temp with real message
        setMessages((prev) =>
          prev.filter((m) => m?.senderType).map((m) => (m.id === tempId ? data.message : m))
        );
      }
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) => prev.filter((m) => m?.senderType && m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="glass rounded-2xl p-6 flex flex-col"
      style={{ height: "500px", maxHeight: "500px" }}
    >
      <h2 className="text-lg font-semibold mb-4">Client Chat</h2>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="overflow-y-auto space-y-3 pr-1"
        style={{ height: "380px", overflowY: "scroll" }}
      >
        {loading ? (
          <p className="text-sm text-foreground/50 text-center py-8">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-foreground/50 text-center py-8">
            No messages yet
          </p>
        ) : (
          messages.map((msg) => {
            const isTeam = msg.senderType === "TEAM";
            return (
              <div
                key={msg.id}
                className={`flex ${isTeam ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    isTeam
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-foreground/10 text-foreground rounded-bl-sm"
                  }`}
                >
                  {!isTeam && (
                    <p className="text-xs font-semibold text-primary mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${isTeam ? "text-primary-foreground/60" : "text-foreground/40"} text-right`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-foreground/10 pt-4 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary/50"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}