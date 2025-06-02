import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ChatPage() {
    const [threads, setThreads] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }

        // This should come from your backend later
        const threadsFromServer = [
            { id: 1, threadName: "My Thread 1", createdAt: "2025-03-01T10:00:00Z" },
            { id: 2, threadName: "hello thread", createdAt: "2025-03-02T10:00:00Z" },
            { id: 3, threadName: "Last Thread", createdAt: "2025-03-03T10:00:00Z" },
            { id: 4, threadName: "This is really the last thread", createdAt: "2025-03-03T10:00:00Z" },
        ];

        setThreads(threadsFromServer);
    }, [router]);

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
                                JD
                            </label>
                            <div className="dropdown-menu">
                                <a href="#">Profile</a>
                                <a href="#">Settings</a>
                                <a href="#">Logout</a>
                            </div>
                            <label htmlFor="profile-toggle" className="overlay"></label>
                        </div>
                    </div>
                </header>
                <div className="center-container">
                    <aside className="threads-list">
                        <h2>Threads</h2>
                        <div className="threads">
                            {threads &&
                                threads.map((thread) => (
                                    <div key={thread.id} className="thread-item">
                                        {thread.threadName}
                                    </div>
                                ))}
                        </div>
                    </aside>
                    <main className="main-container">
                        <div className="chat-window">
                            <div className="chat-model-select">
                                <select id="model-select">
                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    <option value="gpt-4">GPT-4</option>
                                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    <option value="custom-model">Custom Model...</option>
                                </select>
                            </div>
                            <div className="messages">
                                <div className="message bot">
                                    Hello! I’m ChatGPT—how can I help you today?
                                </div>
                                <div className="message user">Can you show me how this chat layout works?</div>
                            </div>
                            <div className="input-container">
                                <input type="text" placeholder="Type a message…" />
                                <button>➤</button>
                            </div>
                        </div>
                    </main>
                </div>
                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );
}
