import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext({});

const publicRoutes = ['/login', '/signup'];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const verifyToken = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            if (!publicRoutes.includes(router.pathname)) {
                router.push('/login');
            }
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/auth/verify", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const userData = localStorage.getItem('user');
                if (userData) {
                    setUser(JSON.parse(userData));
                }
                if (publicRoutes.includes(router.pathname)) {
                    router.push('/chat');
                }
            } else {
                logout();
            }
        } catch (err) {
            console.error("Token verification failed:", err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            id: data.id,
            email: data.email,
            name: data.name
        }));

        setUser(data);
        router.push("/chat");
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    useEffect(() => {
        verifyToken();
    }, [router.pathname]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);