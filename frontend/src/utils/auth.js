export const verifyToken = async (router, onValid) => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
        router.push("/login");
        return false;
    }

    try {
        const res = await fetch("http://localhost:8080/auth/verify", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            if (userData && onValid) {
                onValid(JSON.parse(userData));
            }
            return true;
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
            return false;
        }
    } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return false;
    }
};
