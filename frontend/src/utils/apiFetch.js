export async function apiFetch(url, options = {}, router) {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.status === 401 || res.status === 403 || res.status === 404) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (router) {
            router.push("/login");
        }

        throw new Error("Unauthorized or user not found");
    }

    return res;
}
