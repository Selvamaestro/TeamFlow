"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "../dashboard/dashboard.css";
import "./chat.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";
import chatService from "@/services/chatService";
import { connectSocket, getSocket, disconnectSocket } from "@/lib/socket";
import { Search, Send, Paperclip, X, FileText, Megaphone, Users as UsersIcon, User as UserIcon } from "lucide-react";

const TYPE_ICON = { global: Megaphone, project_group: UsersIcon, direct: UserIcon };

function conversationLabel(conversation, otherUserNames) {
  if (conversation.type === "global") return "Announcements";
  if (conversation.type === "project_group") return conversation.name || "Project Group";
  return otherUserNames[conversation._id] || "Direct Message";
}

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const threadRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [otherUserNames, setOtherUserNames] = useState({});
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

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      if (res?.data?.user) setUser(res.data.user);
    }).catch(() => null);
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setLoadError(null);
    try {
      const list = await chatService.listConversations();
      setConversations(list);

      const directChats = list.filter((c) => c.type === "direct");
      const names = {};
      await Promise.all(
        directChats.map(async (c) => {
          const otherId = c.participants.find((p) => p !== user?.id && p !== user?._id);
          if (!otherId) return;
          try {
            const res = await api.get(`/users/${otherId}`);
            names[c._id] = res.data?.user?.name || res.data?.name;
          } catch {
            // leave unresolved
          }
        })
      );
      setOtherUserNames(names);

      if (list.length > 0) setActiveId((prev) => prev || list[0]._id);
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Couldn't load your conversations right now.");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user?.id, user?._id]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  useEffect(() => {
    if (!user) return;
    connectSocket();
    return () => disconnectSocket();
  }, [user]);

  useEffect(() => {
    if (!activeId) return;
    setIsLoadingMessages(true);
    chatService
      .listMessages(activeId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setIsLoadingMessages(false));

    const socket = getSocket();
    socket.emit("conversation:join", { conversationId: activeId });
  }, [activeId]);

  useEffect(() => {
    const socket = getSocket();
    const myId = user?.id || user?._id;

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
  }, [activeId, user, typingUserId]);

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

  function handleFilePick(e) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
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
        const uploaded = await chatService.uploadAttachment(fileToSend);
        attachmentFields = {
          attachmentUrl: uploaded.attachmentUrl,
          attachmentName: uploaded.attachmentName,
          attachmentType: uploaded.attachmentType,
        };
        setIsUploading(false);
      }
      const message = await chatService.sendMessage(activeId, { content, ...attachmentFields });
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
      setConversations((prev) =>
        prev
          .map((c) => (c._id === activeId ? { ...c, lastMessageAt: new Date().toISOString() } : c))
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      );
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Couldn't send that message.");
      setMessageText(content);
      setPendingFile(fileToSend);
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  }

  const filteredConversations = conversations.filter((c) =>
    conversationLabel(c, otherUserNames).toLowerCase().includes(search.toLowerCase())
  );

  const myId = user?.id || user?._id;

  return (
    <div className="dashboard-container">
      <Sidebar active="chat" />
      <div className="main-content">
        <Navbar user={user} helpText="Team Chat — Announcements, project groups, and direct messages." />

        <div className="chat-page">
          <div className="chat-list">
            <div className="chat-list-search">
              <Search size={18} />
              <input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="chat-list-items">
              {isLoadingConversations ? (
                <p className="chat-empty">Loading...</p>
              ) : filteredConversations.length === 0 ? (
                <p className="chat-empty">No conversations found.</p>
              ) : (
                filteredConversations.map((c) => {
                  const Icon = TYPE_ICON[c.type] || UsersIcon;
                  return (
                    <button
                      key={c._id}
                      onClick={() => setActiveId(c._id)}
                      className={`chat-list-item ${activeId === c._id ? "active" : ""}`}
                    >
                      <div className="chat-avatar">
                        <Icon size={20} />
                      </div>
                      <div className="chat-list-item-text">
                        <h4>{conversationLabel(c, otherUserNames)}</h4>
                        <p>{c.type.replace("_", " ")}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="chat-thread">
            {!activeConversation ? (
              <div className="chat-empty-state">
                {isLoadingConversations ? "Loading..." : "Select a conversation to start chatting."}
              </div>
            ) : (
              <>
                <div className="chat-thread-header">
                  <div className="chat-avatar">
                    {(() => {
                      const Icon = TYPE_ICON[activeConversation.type] || UsersIcon;
                      return <Icon size={20} />;
                    })()}
                  </div>
                  <div>
                    <h3>{conversationLabel(activeConversation, otherUserNames)}</h3>
                    <p>
                      {activeConversation.participants.length} participant
                      {activeConversation.participants.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div ref={threadRef} className="chat-messages">
                  {isLoadingMessages ? (
                    <p className="chat-empty">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="chat-empty">No messages yet. Say hello!</p>
                  ) : (
                    messages.map((m) => {
                      const senderId = typeof m.sender === "object" ? m.sender?._id : m.sender;
                      const senderName = typeof m.sender === "object" ? m.sender?.name : null;
                      const isSelf = senderId === myId;
                      const showName = !isSelf && activeConversation.type !== "direct" && senderName;
                      const isImage = m.attachmentType?.startsWith("image/");
                      return (
                        <div key={m._id} className={`chat-msg-row ${isSelf ? "self" : ""}`}>
                          <div className="chat-msg-col">
                            {showName && <span className="chat-msg-sender">{senderName}</span>}
                            <div className={`chat-bubble ${isSelf ? "self" : ""}`}>
                              {m.content && <p>{m.content}</p>}
                              {m.attachmentUrl && isImage && (
                                <a href={m.attachmentUrl} target="_blank" rel="noreferrer">
                                  <img src={m.attachmentUrl} alt={m.attachmentName || "attachment"} className="chat-attachment-img" />
                                </a>
                              )}
                              {m.attachmentUrl && !isImage && (
                                <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="chat-attachment-file">
                                  <FileText size={16} />
                                  <span>{m.attachmentName || "Attachment"}</span>
                                </a>
                              )}
                            </div>
                            <span className="chat-msg-time">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {typingUserId && <div className="chat-typing">Someone is typing...</div>}
                </div>

                {loadError && <div className="chat-error">{loadError}</div>}

                <form onSubmit={handleSend} className="chat-composer">
                  {pendingFile && (
                    <div className="chat-pending-file">
                      <Paperclip size={16} />
                      <span>{pendingFile.name}</span>
                      <button type="button" onClick={() => setPendingFile(null)}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="chat-composer-row">
                    <input ref={fileInputRef} type="file" className="chat-file-input" onChange={handleFilePick} />
                    <button type="button" className="chat-attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach a file">
                      <Paperclip size={18} />
                    </button>
                    <textarea
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
                    <button type="submit" disabled={isSending || (!messageText.trim() && !pendingFile)} className="chat-send-btn">
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
