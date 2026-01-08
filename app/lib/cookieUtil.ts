"use server"

import {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";
import {cookies} from "next/headers";
import {RequestCookie} from "next/dist/compiled/@edge-runtime/cookies";

export async function setCookie(key :  string, value : string) {
    const cookieStore : ReadonlyRequestCookies = await cookies();
    cookieStore.set(key, value, {
        maxAge : 60 * 60 * 24 * 365 // 1 year in seconds
    });
}

export async function getCookie(key : string) : Promise<string | undefined> {
    const cookieStore : ReadonlyRequestCookies = await cookies();
    let cookie : RequestCookie | undefined = cookieStore.get(key);
    if (cookie){
        return cookie.value;
    }
    return undefined;
}