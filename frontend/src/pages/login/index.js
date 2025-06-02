import Head from "next/head";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/chat");
        }
    }, [router]);

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload on form submit
        setLoading(true);

        try {
            const credentials = btoa(`${email}:${password}`);

            const response = await axios.post(
                "http://localhost:8080/auth/login",
                {}, // No body required, credentials are in headers
                {
                    headers: {
                        Authorization: `Basic ${credentials}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Save JWT token to localStorage
            localStorage.setItem("token", response.data.token);

            setLoading(false);
            router.push("/chat"); // Redirect to chat page
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed. Please check your email and password.");
            setLoading(false);
            setEmail("");
            setPassword("");
        }
    };

    return (
        <>
            <Head>
                <title>Login - Chat App</title>
            </Head>

            <div className="page-container">
                <header>
                    <div className="header-content">
                        <div className="header-brand">
                            <img
                                src="./bootcamp-2025.03-logo.jpg"
                                alt="Logo"
                                className="header-logo"
                            />
                            <div className="header-title">Chat Application</div>
                        </div>
                    </div>
                </header>

                <main className="content">
                    <form className="login-form" onSubmit={handleLogin}>
                        <h2>Login</h2>

                        <div className="form-group">
                            <label htmlFor="login-email">Email</label>
                            <input
                                type="email"
                                id="login-email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={handleEmailChange}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <input
                                type="password"
                                id="login-password"
                                placeholder="••••••••"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={loading} className="btn btn-primary">
                                {loading ? "Signing In…" : "Sign In"}
                            </button>
                        </div>
                    </form>
                </main>

                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );
}
