import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8080/chats/my-chats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push("/login");
                    return;
                }
                throw new Error("Failed to load threads");
            }

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
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:8080/messages?chatId=${thread.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to load messages");

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

        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8080/chats", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    title: newThreadTitle,
                }),
            });

            if (!res.ok) throw new Error("Failed to create thread");

            const newThread = await res.json();
            setThreads(prev => [newThread, ...prev]);
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

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:8080/chats/${threadId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to delete thread");

            setThreads(prev => prev.filter(t => t.id !== threadId));
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

        const token = localStorage.getItem("token");
        const model = document.getElementById("model-select")?.value || "mixtral-8x7b-32768";

        // Add user message immediately for better UX
        const userMessage = {
            role: "user",
            content: messageInput.trim(),
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = messageInput;
        setMessageInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8080/messages/send", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    chatId: selectedThread.id,
                    content: currentInput,
                    model,
                }),
            });

            if (!res.ok) throw new Error("Failed to send message");

            const reply = await res.json();
            setMessages(prev => [...prev, reply]);
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message");
            // Remove the optimistically added message on error
            setMessages(prev => prev.slice(0, -1));
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
                            <img src="/bootcamp-2025.03-logo.jpg" alt="Logo" className="header-logo" />
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
                                <a href="#">Profile</a>
                                <a href="#">Settings</a>
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
                    <div style={{
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        padding: "0.75rem 1.25rem",
                        marginBottom: "1rem",
                        border: "1px solid #f5c6cb",
                        borderRadius: "0.25rem"
                    }}>
                        {error}
                        <button
                            onClick={() => setError("")}
                            style={{ float: "right", background: "none", border: "none", fontSize: "1.2em" }}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="center-container">
                    <aside className="threads-list">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h2>Conversations</h2>
                            <button
                                onClick={() => setShowNewThreadModal(true)}
                                style={{
                                    background: "#007bff",
                                    color: "white",
                                    border: "none",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                + New
                            </button>
                        </div>

                        <div className="threads">
                            {threads.map((thread) => (
                                <div
                                    key={thread.id}
                                    className={`thread-item ${
                                        selectedThread?.id === thread.id ? "selected" : ""
                                    }`}
                                    onClick={() => handleThreadSelect(thread)}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                >
                                    <span>{thread.title || thread.threadName}</span>
                                    <button
                                        onClick={(e) => handleDeleteThread(thread.id, e)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#dc3545",
                                            cursor: "pointer",
                                            padding: "0.25rem",
                                            fontSize: "0.9em"
                                        }}
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
                                    <option value="llama3-8b-8192">llama3-8B</option>
                                    <option value="llama3-70b-8192">Llama3 70B</option>
                                    <option value="gemma-7b-it">Gemma 7B</option>
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
                                        <div
                                            key={index}
                                            className={`message ${
                                                msg.role === "user" ? "user" : "bot"
                                            }`}
                                        >
                                            <div>{msg.content}</div>
                                            {msg.timestamp && (
                                                <div style={{
                                                    fontSize: "0.8em",
                                                    opacity: 0.7,
                                                    marginTop: "0.25rem"
                                                }}>
                                                    {formatTimestamp(msg.timestamp)}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                {loading && (
                                    <div className="message bot">
                                        <div>Thinking...</div>
                                    </div>
                                )}
                            </div>

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
                        </div>
                    </main>
                </div>

                {/* New Thread Modal */}
                {showNewThreadModal && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: "white",
                            padding: "2rem",
                            borderRadius: "8px",
                            minWidth: "300px"
                        }}>
                            <h3>New Conversation</h3>
                            <input
                                type="text"
                                placeholder="Enter conversation title"
                                value={newThreadTitle}
                                onChange={(e) => setNewThreadTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateThread();
                                    if (e.key === "Escape") setShowNewThreadModal(false);
                                }}
                                style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    marginBottom: "1rem",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px"
                                }}
                                autoFocus
                            />
                            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                <button
                                    onClick={() => setShowNewThreadModal(false)}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        background: "white",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateThread}
                                    disabled={!newThreadTitle.trim()}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        border: "none",
                                        borderRadius: "4px",
                                        background: "#007bff",
                                        color: "white",
                                        cursor: "pointer"
                                    }}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );
}