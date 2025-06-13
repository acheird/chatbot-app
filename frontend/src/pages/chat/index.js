import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/chatPage.module.css";
import { apiFetch } from "@/utils/apiFetch";

export default function ChatPage() {
    const [threads, setThreads] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState("");
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token) {
            router.push("/login");
            return;
        }

        if (userData) {
            setUser(JSON.parse(userData));
        }

        loadThreads();
    }, [router]);

    const loadThreads = async () => {
        try {
            const res = await apiFetch("http://localhost:8080/chats/my-chats", {}, router);
            const data = await res.json();
            setThreads(data);
        } catch (err) {
            console.error("Error fetching threads", err);
            setError("Failed to load conversations");
        }
    };

    const handleThreadSelect = async (thread) => {
        setSelectedThread(thread);
        setLoading(true);
        setError("");

        try {
            const res = await apiFetch(`http://localhost:8080/messages?chatId=${thread.id}`, {}, router);
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateThread = async () => {
        if (!newThreadTitle.trim()) return;

        try {
            const res = await apiFetch("http://localhost:8080/chats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    title: newThreadTitle,
                }),
            }, router);

            const newThread = await res.json();
            setThreads((prev) => [newThread, ...prev]);
            setNewThreadTitle("");
            setShowNewThreadModal(false);
            setSelectedThread(newThread);
            setMessages([]);
        } catch (err) {
            console.error("Error creating thread:", err);
            setError("Failed to create new conversation");
        }
    };

    const handleDeleteThread = async (threadId, e) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this conversation?")) return;

        try {
            await apiFetch(`http://localhost:8080/chats/${threadId}`, {
                method: "DELETE",
            }, router);

            setThreads((prev) => prev.filter((t) => t.id !== threadId));
            if (selectedThread?.id === threadId) {
                setSelectedThread(null);
                setMessages([]);
            }
        } catch (err) {
            console.error("Error deleting thread:", err);
            setError("Failed to delete conversation");
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedThread) return;

        const model = document.getElementById("model-select")?.value || "llama3-8b-8192";
        const userMessage = {
            role: "user",
            content: messageInput.trim(),
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = messageInput;
        setMessageInput("");
        setLoading(true);

        try {
            const res = await apiFetch("http://localhost:8080/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    chatId: selectedThread.id,
                    content: currentInput,
                    model,
                }),
            }, router);

            const reply = await res.json();
            setMessages((prev) => [...prev, reply]);
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message");
            setMessages((prev) => prev.slice(0, -1));
            setMessageInput(currentInput);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <>
            <Head>
                <title>Chat - My App</title>
            </Head>
            <div className="page-container">
                <header>
                    <div className="header-content">
                        <div className="header-brand">
                            <img src="/ai.png" alt="Logo" className="header-logo" />
                            <div className="header-title">Chat Application</div>
                        </div>
                        <div className="profile-dropdown">
                            <input type="checkbox" id="profile-toggle" />
                            <label htmlFor="profile-toggle" className="profile-icon">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </label>
                            <div className="dropdown-menu">
                                <div style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                                    <strong>{user?.name}</strong>
                                    <div style={{ fontSize: "0.9em", color: "#666" }}>{user?.email}</div>
                                </div>
                                <a href="/profile">Profile</a>
                                <a href="/settings">Settings</a>
                                <a
                                    href="#"
                                    onClick={() => {
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("user");
                                        router.push("/login");
                                    }}
                                >
                                    Logout
                                </a>
                            </div>
                            <label htmlFor="profile-toggle" className="overlay"></label>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className={styles.errorBanner}>
                        {error}
                        <button onClick={() => setError("")} className={styles.errorClose}>
                            ×
                        </button>
                    </div>
                )}

                <div className="center-container">
                    <aside className="threads-list">
                        <div className={styles.threadHeader}>
                            <h2>Conversations</h2>
                            <button onClick={() => setShowNewThreadModal(true)} className={styles.newThreadButton}>
                                + New
                            </button>
                        </div>

                        <div className="threads">
                            {threads.map((thread) => (
                                <div
                                    key={thread.id}
                                    className={`thread-item ${styles.threadItem} ${selectedThread?.id === thread.id ? "selected" : ""}`}
                                    onClick={() => handleThreadSelect(thread)}
                                >
                                    <span>{thread.title || thread.threadName}</span>
                                    <button
                                        onClick={(e) => handleDeleteThread(thread.id, e)}
                                        className={styles.deleteButton}
                                        title="Delete conversation"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <main className="main-container">
                        <div className="chat-window">
                            <div className="chat-model-select">
                                <select id="model-select">
                                    <option value="llama3-8b-8192">llama3-8B (Default)</option>
                                    <option value="llama3-70b-8192">Llama3 70B</option>
                                </select>
                            </div>

                            <div className="messages">
                                {!selectedThread ? (
                                    <div className="message bot" style={{ textAlign: "center", color: "#666" }}>
                                        Select a conversation or create a new one to start chatting
                                    </div>
                                ) : loading && messages.length === 0 ? (
                                    <div className="message bot">Loading messages...</div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div key={index} className={`message ${msg.role === "user" ? "user" : "bot"}`}>
                                            {msg.content}
                                            <div className={styles.messageTimestamp}>{formatTimestamp(msg.timestamp)}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {selectedThread && (
                                <div className="input-container">
                                    <input
                                        type="text"
                                        placeholder={selectedThread ? "Type a message…" : "Select a conversation first"}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        disabled={!selectedThread || loading}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!selectedThread || loading || !messageInput.trim()}
                                    >
                                        ➤
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>

                {showNewThreadModal && (
                    <div className={styles.newThreadModalOverlay}>
                        <div className={styles.newThreadModal}>
                            <h3>Create New Conversation</h3>
                            <input
                                type="text"
                                placeholder="Enter conversation title"
                                value={newThreadTitle}
                                onChange={(e) => setNewThreadTitle(e.target.value)}
                                className={styles.modalInput}
                                autoFocus
                            />
                            <div className={styles.modalButtonGroup}>
                                <button onClick={() => setShowNewThreadModal(false)} className={styles.modalCancel}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateThread}
                                    disabled={!newThreadTitle.trim()}
                                    className={styles.modalCreate}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
