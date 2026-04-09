import {cookies} from "next/headers";

export async function getXsrfToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get("XSRF-TOKEN")?.value;
}
