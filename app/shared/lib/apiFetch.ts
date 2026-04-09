"use client";

function getXsrfTokenFromCookie(): string | undefined {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
}

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const csrfToken = getXsrfTokenFromCookie();
    return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(csrfToken && {"X-XSRF-TOKEN": csrfToken}),
            ...options.headers,
        },
    });
}
