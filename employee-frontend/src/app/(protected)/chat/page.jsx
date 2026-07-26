"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import EmployeeLayout from "../../../components/EmployeeLayout";
import { useAuth } from "../../../context/AuthContext";
import * as communicationApi from "../../../api/communication.api";
import { getSocket } from "../../../utils/socket";

const TYPE_META = {
  global: { icon: "campaign", label: "Company" },
  project_group: { icon: "assignment", label: "Projects" },
  direct: { icon: "person", label: "Direct Messages" },
};

function selfId(user) {
  return user?.id || user?._id;
}

function Avatar({ name, avatarUrl, size = 44, icon }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name || "User"}
        width={size}
        height={size}
        className="rounded-xl object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-xl bg-primary-container flex items-center justify-center text-white font-label-md shrink-0"
      style={{ width: size, height: size }}
    >
      {icon ? (
        <span className="material-symbols-outlined">{icon}</span>
      ) : (
        name?.[0]?.toUpperCase() || "?"
      )}
    </div>
  );
}

// Resolves a display name/avatar/icon for a conversation from the logged-in user's POV.
function describeConversation(conv, myId) {
  if (conv.type === "direct") {
    const other = (conv.participants || []).find((p) => p._id !== myId);
    return {
      name: other?.name || "Direct Message",
      avatarUrl: other?.avatarUrl,
      icon: "person",
      subtitle: other?.role ? other.role.replace("_", " ") : "",
    };
  }
  if (conv.type === "project_group") {
    return { name: conv.name || "Project Team", icon: "assignment", subtitle: "Project group" };
  }
  return { name: conv.name || "Company", icon: "campaign", subtitle: "Everyone at the company" };
}

function relativeTime(dateLike) {
  if (!dateLike) return "";
  const diffMs = Date.now() - new Date(dateLike).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateLike).toLocaleDateString([], { month: "short", day: "numeric" });
}

function dayLabel(dateLike) {
  const d = new Date(dateLike);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function ChatPage() {
  const { user } = useAuth();
  const myId = selfId(user);

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [typingUsers, setTypingUsers] = useState({}); // conversationId -> Set of userIds

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const threadRef = useRef(null);
  const pollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    setIsLoadingList(true);
    setLoadError(null);
    try {
      const list = await communicationApi.listConversations();
      setConversations(list);
      setSelectedId((prev) => prev || (list.length > 0 ? list[0]._id : null));
    } catch (err) {
      setLoadError(err.message || "Couldn't load your conversations right now.");
    } finally {
      setIsLoadingList(false);
    }
  }

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedId) || null,
    [conversations, selectedId]
  );

  const loadMessages = useCallback(async (conversationId, { silent } = {}) => {
    if (!conversationId) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const list = await communicationApi.listMessages(conversationId);
      setMessages(list);
    } catch (err) {
      if (!silent) setLoadError(err.message || "Couldn't load messages.");
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  }, []);

  // Load messages for the selected conversation + wire real-time / polling.
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedId);

    const socket = getSocket();

    if (socket) {
      socket.emit("conversation:join", { conversationId: selectedId });

      const handleNewMessage = (msg) => {
        const msgConvId = typeof msg.conversation === "string" ? msg.conversation : msg.conversation?._id;
        if (msgConvId !== selectedId) return;
        setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      };
      const handleTypingStart = ({ conversationId, userId }) => {
        if (conversationId !== selectedId || userId === myId) return;
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: new Set([...(prev[conversationId] || []), userId]),
        }));
      };
      const handleTypingStop = ({ conversationId, userId }) => {
        setTypingUsers((prev) => {
          const next = new Set(prev[conversationId] || []);
          next.delete(userId);
          return { ...prev, [conversationId]: next };
        });
      };

      socket.on("message:new", handleNewMessage);
      socket.on("typing:start", handleTypingStart);
      socket.on("typing:stop", handleTypingStop);

      return () => {
        socket.off("message:new", handleNewMessage);
        socket.off("typing:start", handleTypingStart);
        socket.off("typing:stop", handleTypingStop);
      };
    }

    // No socket available yet (e.g. right after a hard refresh, before the
    // in-memory token is repopulated) — poll instead so chat still works.
    pollRef.current = setInterval(() => loadMessages(selectedId, { silent: true }), 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, selectedId]);

  function handleTyping() {
    const socket = getSocket();
    if (!socket || !selectedId) return;
    socket.emit("typing:start", { conversationId: selectedId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId: selectedId });
    }, 1500);
  }

  async function handleSend(e) {
    e.preventDefault();
    const content = messageText.trim();
    if (!content || !selectedId || isSending) return;
    setIsSending(true);
    setMessageText("");
    try {
      const message = await communicationApi.sendMessage(selectedId, { content });
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
      setConversations((prev) =>
        [...prev]
          .map((c) => (c._id === selectedId ? { ...c, lastMessageAt: new Date().toISOString() } : c))
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      );
    } catch (err) {
      setLoadError(err.message || "Couldn't send that message.");
      setMessageText(content);
    } finally {
      setIsSending(false);
    }
  }

  const grouped = useMemo(() => {
    const buckets = { global: [], project_group: [], direct: [] };
    conversations.forEach((c) => {
      if (buckets[c.type]) buckets[c.type].push(c);
    });
    return buckets;
  }, [conversations]);

  const messageGroups = useMemo(() => {
    const groups = [];
    messages.forEach((m) => {
      const label = dayLabel(m.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.items.push(m);
      } else {
        groups.push({ label, items: [m] });
      }
    });
    return groups;
  }, [messages]);

  const activeTypingNames = useMemo(() => {
    if (!selectedConversation) return [];
    const ids = Array.from(typingUsers[selectedId] || []);
    return ids
      .map((id) => selectedConversation.participants?.find((p) => p._id === id)?.name)
      .filter(Boolean);
  }, [typingUsers, selectedId, selectedConversation]);

  const meta = selectedConversation ? describeConversation(selectedConversation, myId) : null;

  return (
    <EmployeeLayout title="Chat">
      {loadError && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md mb-4">
          {loadError}
        </div>
      )}

      <div className="flex border border-outline-variant rounded-[16px] overflow-hidden shadow-sm bg-white h-[calc(100vh-220px)] min-h-[520px]">
        {/* Conversation list */}
        <div className="w-80 border-r border-outline-variant bg-surface-container-lowest flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto">
            {isLoadingList ? (
              <p className="p-4 text-label-md text-on-surface-variant">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-label-md text-on-surface-variant">No conversations yet.</p>
            ) : (
              ["global", "project_group", "direct"].map((type) =>
                grouped[type].length === 0 ? null : (
                  <div key={type} className="p-4">
                    <h3 className="text-[11px] font-bold text-outline uppercase tracking-widest mb-3">
                      {TYPE_META[type].label}
                    </h3>
                    <div className="space-y-1">
                      {grouped[type].map((conv) => {
                        const d = describeConversation(conv, myId);
                        const isActive = conv._id === selectedId;
                        return (
                          <button
                            key={conv._id}
                            onClick={() => setSelectedId(conv._id)}
                            className={`w-full text-left flex gap-3 p-3 rounded-lg transition-all ${
                              isActive
                                ? "bg-secondary-container/40 border-l-4 border-primary"
                                : "hover:bg-surface-container-low border-l-4 border-transparent"
                            }`}
                          >
                            <Avatar name={d.name} avatarUrl={d.avatarUrl} icon={d.icon} size={44} />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-label-md font-bold text-primary truncate">{d.name}</h4>
                                <span className="text-[10px] text-outline shrink-0">
                                  {relativeTime(conv.lastMessageAt || conv.createdAt)}
                                </span>
                              </div>
                              <p className="text-label-sm text-on-surface-variant truncate">{d.subtitle}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col bg-surface">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant font-label-md">
              Select a conversation to start chatting.
            </div>
          ) : (
            <>
              <div className="h-20 border-b border-outline-variant bg-white/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar name={meta.name} avatarUrl={meta.avatarUrl} icon={meta.icon} size={48} />
                  <div>
                    <h3 className="font-headline-md text-[20px] font-bold text-primary">{meta.name}</h3>
                    <p className="text-label-sm text-on-surface-variant">
                      {selectedConversation.participants?.length || 0} member
                      {selectedConversation.participants?.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>

              <div ref={threadRef} className="flex-1 overflow-y-auto p-8 space-y-6">
                {isLoadingMessages ? (
                  <p className="text-label-md text-on-surface-variant">Loading messages...</p>
                ) : messageGroups.length === 0 ? (
                  <p className="text-label-md text-on-surface-variant">
                    No messages yet — say hello to get things started.
                  </p>
                ) : (
                  messageGroups.map((group) => (
                    <div key={group.label} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-[1px] bg-outline-variant" />
                        <span className="text-[11px] font-bold text-outline uppercase tracking-widest">
                          {group.label}
                        </span>
                        <div className="flex-1 h-[1px] bg-outline-variant" />
                      </div>
                      {group.items.map((msg) => {
                        const isMine = msg.sender?._id === myId;
                        return isMine ? (
                          <div key={msg._id} className="flex items-start gap-4 justify-end">
                            <div className="space-y-1 flex flex-col items-end max-w-[70%]">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[10px] text-outline">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="text-label-md font-bold text-primary">You</span>
                              </div>
                              <div className="bg-primary-container text-white p-4 rounded-l-2xl rounded-br-2xl shadow-sm">
                                <p className="text-body-md whitespace-pre-wrap break-words">{msg.content}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={msg._id} className="flex items-start gap-4 max-w-[70%]">
                            <Avatar name={msg.sender?.name} avatarUrl={msg.sender?.avatarUrl} size={40} />
                            <div className="space-y-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-label-md font-bold text-primary">
                                  {msg.sender?.name || "Unknown"}
                                </span>
                                <span className="text-[10px] text-outline">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="bg-white border border-outline-variant rounded-r-2xl rounded-bl-2xl p-4 shadow-sm">
                                <p className="text-body-md text-on-surface whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                {activeTypingNames.length > 0 && (
                  <div className="flex items-center gap-2 text-outline animate-pulse">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span className="text-label-sm">{activeTypingNames.join(", ")} typing...</span>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-outline-variant shrink-0">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto">
                  <div className="relative bg-surface-container-low border border-outline-variant rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <div className="flex items-end gap-2">
                      <textarea
                        className="flex-1 py-3 px-3 bg-transparent border-none focus:ring-0 text-body-md resize-none max-h-40"
                        placeholder={`Message ${meta.name}...`}
                        rows={1}
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          handleTyping();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                          }
                        }}
                        disabled={isSending}
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || isSending}
                        className="bg-primary text-white p-3 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined">send</span>
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 px-2 text-[11px] text-outline">
                    Press <kbd className="px-1 py-0.5 bg-surface-container rounded border border-outline-variant">Enter</kbd>{" "}
                    to send,{" "}
                    <kbd className="px-1 py-0.5 bg-surface-container rounded border border-outline-variant">
                      Shift + Enter
                    </kbd>{" "}
                    for a new line
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
