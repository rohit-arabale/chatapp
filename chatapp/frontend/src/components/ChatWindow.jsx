import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Message from "./Message";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const ChatWindow = ({ users = [], selectedUser, socket, onlineUserIds }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [forwarding, setForwarding] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const { data } = await API.get(`/messages/${selectedUser._id}`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err.message);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (message) => {
      const isRelevant =
        (message.sender === selectedUser?._id && message.receiver === user._id) ||
        (message.sender === user._id && message.receiver === selectedUser?._id);

      if (isRelevant) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("message:receive", handleIncoming);
    return () => socket.off("message:receive", handleIncoming);
  }, [socket, selectedUser, user._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if ((!text.trim() && !selectedFile) || !selectedUser || sending) return;

    setSending(true);

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("receiverId", selectedUser._id);
        formData.append("text", text.trim());
        formData.append("attachment", selectedFile);

        const { data: message } = await API.post("/messages/send", formData);

        setMessages((prev) => [...prev, message]);
        socket?.emit("message:share", {
          receiverId: selectedUser._id,
          message,
        });
      } else {
        socket.emit("message:send", {
          senderId: user._id,
          receiverId: selectedUser._id,
          text: text.trim(),
        });
      }

      setText("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to send message:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      alert("Only images, PDF, DOC, and DOCX files are allowed");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      alert("File must be 10 MB or smaller");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const forwardMessage = async (receiverId) => {
    if (!forwardingMessage || forwarding) return;

    setForwarding(true);

    try {
      const { data: message } = await API.post("/messages/forward", {
        messageId: forwardingMessage._id,
        receiverId,
      });

      if (selectedUser?._id === receiverId) {
        setMessages((prev) => [...prev, message]);
      }

      socket?.emit("message:share", {
        receiverId,
        message,
      });

      setForwardingMessage(null);
    } catch (err) {
      console.error("Failed to forward message:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Failed to forward message");
    } finally {
      setForwarding(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="no-chat-selected">
        <div className="big-icon">Chat</div>
        <h3>Select a conversation</h3>
        <p>Pick a user from the sidebar to start chatting</p>
      </div>
    );
  }

  const isOnline = onlineUserIds.includes(selectedUser._id);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar" style={{ width: 36, height: 36, fontSize: "0.85rem" }}>
          {selectedUser.username[0].toUpperCase()}
        </div>
        <div>
          <div className="name">{selectedUser.username}</div>
          <div className={`status ${isOnline ? "online" : ""}`}>
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="icon">*</div>
            <p>No messages yet - say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg._id}
              message={msg}
              isOwn={msg.sender === user._id}
              onForward={setForwardingMessage}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {forwardingMessage && (
        <div className="modal-backdrop" onClick={() => setForwardingMessage(null)}>
          <div className="forward-modal" onClick={(e) => e.stopPropagation()}>
            <div className="forward-modal-header">
              <strong>Forward to</strong>
              <button type="button" onClick={() => setForwardingMessage(null)}>
                Close
              </button>
            </div>
            <div className="forward-user-list">
              {users.map((u) => {
                const isOnline = onlineUserIds.includes(u._id);

                return (
                  <button
                    key={u._id}
                    type="button"
                    className="forward-user"
                    disabled={forwarding}
                    onClick={() => forwardMessage(u._id)}
                  >
                    <span className="avatar">
                      {u.username[0].toUpperCase()}
                      <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
                    </span>
                    <span>
                      <strong>{u.username}</strong>
                      <small>{isOnline ? "Online" : "Offline"}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="selected-file">
          <span>
            {selectedFile.name}
            <small>{formatFileSize(selectedFile.size)}</small>
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            Remove
          </button>
        </div>
      )}

      <div className="chat-input-area">
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          +
        </button>
        <input
          type="text"
          placeholder={`Message ${selectedUser.username}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={sending || (!text.trim() && !selectedFile)}
          title="Send"
        >
          {sending ? "..." : ">"}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
