import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/chat");
        }
    }, [router]);

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Login failed");
            }

            const data = await response.json();

            // Save JWT token and user info to localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({
                id: data.id,
                email: data.email,
                name: data.name
            }));

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

                        {error && (
                            <div className="error-message" style={{
                                color: 'red',
                                marginBottom: '1rem',
                                padding: '0.5rem',
                                border: '1px solid red',
                                borderRadius: '4px',
                                backgroundColor: '#ffebee'
                            }}>
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
                            <button type="submit" disabled={loading} className="btn btn-primary">
                                {loading ? "Signing In…" : "Sign In"}
                            </button>
                        </div>

                        <div className="form-footer">
                            <p>
                                Don't have an account?{" "}
                                <a href="/signup" style={{ color: "#007bff", textDecoration: "none" }}>
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