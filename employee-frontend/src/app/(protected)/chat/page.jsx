"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import EmployeeLayout from "../../../components/EmployeeLayout";
import { useAuth } from "../../../context/AuthContext";
import * as chatApi from "../../../api/chat.api";
import * as userApi from "../../../api/user.api";
import { connectSocket, getSocket, disconnectSocket } from "../../../api/socketClient";

const TYPE_ICON = { global: "campaign", project_group: "assignment", direct: "person" };

function conversationLabel(conversation, otherUserNames) {
  if (conversation.type === "global") return "Announcements";
  if (conversation.type === "project_group") return conversation.name || "Project Group";
  return otherUserNames[conversation._id] || "Direct Message";
}

export default function ChatPage() {
  const { user } = useAuth();
  const threadRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [otherUserNames, setOtherUserNames] = useState({}); // conversationId -> display name (for "direct" chats)
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [typingUserId, setTypingUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const activeConversation = conversations.find((c) => c._id === activeId);
  const myId = user?.id || user?._id;

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setLoadError(null);
    try {
      const list = await chatApi.listConversations();
      setConversations(list);

      // Resolve a display name for direct conversations (the "other" participant).
      const directChats = list.filter((c) => c.type === "direct");
      const names = {};
      await Promise.all(
        directChats.map(async (c) => {
          const otherId = c.participants.find((p) => p !== myId);
          if (!otherId) return;
          try {
            const otherUser = await userApi.getUser(otherId);
            names[c._id] = otherUser.name;
          } catch {
            // leave unresolved; falls back to a generic label
          }
        })
      );
      setOtherUserNames(names);

      if (list.length > 0) setActiveId((prev) => prev || list[0]._id);
    } catch (err) {
      setLoadError(err.message || "Couldn't load your conversations right now.");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [myId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Socket connection lifecycle: connect once per visit to this page, tear down on leave.
  useEffect(() => {
    if (!user) return;
    connectSocket();
    return () => disconnectSocket();
  }, [user]);

  // Load message history whenever the active conversation changes.
  useEffect(() => {
    if (!activeId) return;
    setIsLoadingMessages(true);
    chatApi
      .listMessages(activeId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setIsLoadingMessages(false));

    const socket = getSocket();
    socket.emit("conversation:join", { conversationId: activeId });
  }, [activeId]);

  // Listen for real-time events on the shared socket.
  useEffect(() => {
    const socket = getSocket();

    function handleNewMessage(message) {
      if (message.conversation !== activeId) return;
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
    }
    function handleTypingStart({ conversationId, userId }) {
      if (conversationId === activeId && userId !== myId) setTypingUserId(userId);
    }
    function handleTypingStop({ conversationId, userId }) {
      if (conversationId === activeId && userId === typingUserId) setTypingUserId(null);
    }

    socket.on("message:new", handleNewMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [activeId, myId, typingUserId]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, activeId]);

  function handleTyping() {
    const socket = getSocket();
    socket.emit("typing:start", { conversationId: activeId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId: activeId });
    }, 2000);
  }

  async function handleSend(e) {
    e.preventDefault();
    const content = messageText.trim();
    if ((!content && !pendingFile) || !activeId) return;
    setIsSending(true);
    setMessageText("");
    const fileToSend = pendingFile;
    setPendingFile(null);
    try {
      let attachmentFields = {};
      if (fileToSend) {
        setIsUploading(true);
        const uploaded = await chatApi.uploadAttachment(fileToSend);
        attachmentFields = {
          attachmentUrl: uploaded.attachmentUrl,
          attachmentName: uploaded.attachmentName,
          attachmentType: uploaded.attachmentType,
        };
        setIsUploading(false);
      }
      const message = await chatApi.sendMessage(activeId, { content, ...attachmentFields });
      // The backend also broadcasts this over the socket; guard against a double-append.
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
      setConversations((prev) =>
        prev
          .map((c) => (c._id === activeId ? { ...c, lastMessageAt: new Date().toISOString() } : c))
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      );
    } catch (err) {
      setLoadError(err.message || "Couldn't send that message.");
      setMessageText(content);
      setPendingFile(fileToSend);
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  }

  function handleFilePick(e) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  }

  const filteredConversations = conversations.filter((c) =>
    conversationLabel(c, otherUserNames).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <EmployeeLayout title="Chat">
      <div className="bg-white border border-outline-variant rounded-[16px] card-shadow overflow-hidden flex h-[calc(100vh-180px)] min-h-[500px]">
        {/* Conversation list */}
        <div className="w-full sm:w-80 border-r border-outline-variant flex flex-col shrink-0">
          <div className="p-4 border-b border-outline-variant">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px]">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-label-md focus:outline-none focus:border-primary transition-all"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <p className="p-4 text-label-md text-on-surface-variant">Loading...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="p-4 text-label-md text-on-surface-variant">No conversations found.</p>
            ) : (
              <div className="p-2">
                {filteredConversations.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setActiveId(c._id)}
                    className={`w-full flex gap-3 p-3 rounded-lg text-left mb-1 transition-all ${
                      activeId === c._id
                        ? "bg-secondary-container/40 border-l-4 border-primary"
                        : "hover:bg-surface-container-low border-l-4 border-transparent"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined">
                        {TYPE_ICON[c.type] || "chat"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-label-md font-bold text-primary truncate">
                          {conversationLabel(c, otherUserNames)}
                        </h4>
                      </div>
                      <p className="text-label-sm text-on-surface-variant capitalize">
                        {c.type.replace("_", " ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col bg-surface">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant font-label-md">
              {isLoadingConversations ? "Loading..." : "Select a conversation to start chatting."}
            </div>
          ) : (
            <>
              <div className="h-16 border-b border-outline-variant bg-white/80 backdrop-blur-md px-6 flex items-center gap-4 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">
                    {TYPE_ICON[activeConversation.type] || "chat"}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[18px] font-bold text-primary">
                    {conversationLabel(activeConversation, otherUserNames)}
                  </h3>
                  <p className="text-label-sm text-on-surface-variant">
                    {activeConversation.participants.length} participant
                    {activeConversation.participants.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div ref={threadRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingMessages ? (
                  <p className="text-label-md text-on-surface-variant">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-label-md text-on-surface-variant">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((m) => {
                    const senderId = typeof m.sender === "object" ? m.sender?._id : m.sender;
                    const senderName = typeof m.sender === "object" ? m.sender?.name : null;
                    const isSelf = senderId === myId;
                    const showName = activeConversation.type !== "direct" && (senderName || isSelf);
                    const isImage = m.attachmentType?.startsWith("image/");
                    return (
                      <div key={m._id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] space-y-1 ${isSelf ? "items-end flex flex-col" : ""}`}>
                          {showName && (
                            <span className="text-[11px] font-bold text-primary px-1">
                              {isSelf ? "You" : senderName}
                            </span>
                          )}
                          <div
                            className={`p-3 rounded-2xl ${
                              isSelf
                                ? "bg-primary text-white rounded-br-none"
                                : "bg-white border border-outline-variant rounded-bl-none"
                            }`}
                          >
                            {m.content && <p className="text-body-md">{m.content}</p>}
                            {m.attachmentUrl && isImage && (
                              <a href={m.attachmentUrl} target="_blank" rel="noreferrer">
                                <img
                                  src={m.attachmentUrl}
                                  alt={m.attachmentName || "attachment"}
                                  className="mt-2 max-w-full max-h-60 rounded-lg"
                                />
                              </a>
                            )}
                            {m.attachmentUrl && !isImage && (
                              <a
                                href={m.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-label-sm ${
                                  isSelf ? "bg-white/15 text-white" : "bg-surface-container-low text-on-surface"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">description</span>
                                <span className="truncate">{m.attachmentName || "Attachment"}</span>
                              </a>
                            )}
                          </div>
                          <span className="text-[10px] text-outline">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {typingUserId && (
                  <div className="flex items-center gap-2 text-outline animate-pulse">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span className="text-label-sm">Someone is typing...</span>
                  </div>
                )}
              </div>

              {loadError && (
                <div className="px-6 py-2 bg-error-container text-on-error-container text-label-sm">
                  {loadError}
                </div>
              )}

              <form onSubmit={handleSend} className="p-4 bg-white border-t border-outline-variant shrink-0">
                {pendingFile && (
                  <div className="mb-2 flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 w-fit max-w-full">
                    <span className="material-symbols-outlined text-[18px] text-primary">attach_file</span>
                    <span className="text-label-sm truncate max-w-[220px]">{pendingFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setPendingFile(null)}
                      className="text-outline hover:text-error"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2 bg-surface-container-low border border-outline-variant rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-all"
                    title="Attach a file"
                  >
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>
                  <textarea
                    className="flex-1 py-2 px-2 bg-transparent border-none focus:ring-0 text-body-md resize-none max-h-32"
                    rows={1}
                    placeholder={`Message ${conversationLabel(activeConversation, otherUserNames)}...`}
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
                  />
                  <button
                    type="submit"
                    disabled={isSending || (!messageText.trim() && !pendingFile)}
                    className="bg-primary text-white p-3 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined">
                      {isUploading ? "hourglass_top" : "send"}
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}