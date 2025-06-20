import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const text = await response.text();
                let errorMsg = "Login failed";
                try {
                    const errorData = JSON.parse(text);
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch {
                    if (text) errorMsg = text;
                }

                // Instead of throwing, set error state and stop here:
                setError(errorMsg);
                setLoading(false);
                return;
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({ id: data.id, email: data.email, name: data.name })
            );

            setLoading(false);
            router.push("/chat");
        } catch (error) {
            console.error("Login failed", error);
            setError(error.message || "Login failed. Please check your credentials.");
            setLoading(false);
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
                            <img src="./ai.png" alt="Logo" className="header-logo" />
                            <div className="header-title">Chat Application</div>
                        </div>
                    </div>
                </header>

                <main className="content">
                    <form className="login-form" onSubmit={handleLogin}>
                        <h2>Login</h2>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

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
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading ? "Signing In…" : "Sign In"}
                            </button>
                        </div>

                        <div className="form-footer">
                            <p>
                                Don't have an account?{" "}
                                <a
                                    href="/signup"
                                    style={{ color: "#007bff", textDecoration: "none" }}
                                >
                                    Sign up here
                                </a>
                            </p>
                        </div>
                    </form>
                </main>

                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );
}
