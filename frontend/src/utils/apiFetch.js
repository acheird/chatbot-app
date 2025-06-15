// utils/apiFetch.js
export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = '/login';
            throw new Error("Unauthorized");
        }

        return res;
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}