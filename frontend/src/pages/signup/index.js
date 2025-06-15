import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    username: formData.username
                }),
            });

            if (!response.ok) {
                let errorMessage = "Signup failed";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || JSON.stringify(errorData) || errorMessage;
                } catch {
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                }
                setError(errorMessage);
                setLoading(false);
                return;
            }

            const data = await response.json();

            alert("Account created successfully! Please log in.");
            router.push("/login");
        } catch (error) {
            console.error("Signup failed", error);
            setError(error.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Sign Up - Chat App</title>
            </Head>

            <div className="page-container">
                <header>
                    <div className="header-content">
                        <div className="header-brand">
                            <img
                                src="./ai.png"
                                alt="Logo"
                                className="header-logo"
                            />
                            <div className="header-title">Chat Application</div>
                        </div>
                    </div>
                </header>

                <main className="content">
                    <form className="login-form" onSubmit={handleSignup}>
                        <h2>Create Account</h2>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="signup-username">Username</label>
                            <input
                                type="text"
                                id="signup-username"
                                name="username"
                                placeholder="Your name"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-email">Email</label>
                            <input
                                type="email"
                                id="signup-email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                autoComplete="username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-password">Password</label>
                            <input
                                type="password"
                                id="signup-password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                autoComplete="new-password"
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-confirm-password">Confirm Password</label>
                            <input
                                type="password"
                                id="signup-confirm-password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                autoComplete="new-password"
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={loading} className="btn btn-primary">
                                {loading ? "Creating Account…" : "Create Account"}
                            </button>
                        </div>

                        <div className="form-footer">
                            <p>
                                Already have an account?{" "}
                                <a href="/login" style={{ color: "#007bff", textDecoration: "none" }}>
                                    Sign in here
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
