import Head from "next/head";
import { useEffect, useState } from "react";
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/chat");
        }
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.username) {
            setError("All fields are required");
            return false;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }

        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

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

            // Show success message and redirect to login
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
                                minLength="6"
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
                                minLength="6"
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