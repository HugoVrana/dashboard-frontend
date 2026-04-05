"use server";

import {loginWithOAuth2, completeMfaLogin, initiatePkce} from "@/app/auth/oauth2";
import {cookies} from "next/headers";
import {createCipheriv, createDecipheriv, createHash, randomBytes} from "crypto";
import type {LoginActionResult} from "@/app/auth/models/authMessaging/loginActionResult";
import type {InitiatePkceResult} from "@/app/auth/models/authMessaging/initiatePkceResult";
import type {CompleteMfaActionResult} from "@/app/auth/models/authMessaging/completeMfaActionResult";
import {MfaPendingPayload} from "@/app/auth/models/authMessaging/mfaPendingPayload";
import {PkceStatePayload} from "@/app/auth/models/authMessaging/pkceStatePayload";

export type { LoginActionResult } from "@/app/auth/models/authMessaging/loginActionResult";
export type { InitiatePkceResult } from "@/app/auth/models/authMessaging/initiatePkceResult";
export type { CompleteMfaActionResult } from "@/app/auth/models/authMessaging/completeMfaActionResult";

// ---------------------------------------------------------------------------
// MFA pending cookie helpers
// ---------------------------------------------------------------------------

const MFA_COOKIE_NAME = "mfa_pending";
const MFA_COOKIE_MAX_AGE = 5 * 60; // 5 minutes
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET is not set");
    return createHash("sha256").update(secret).digest();
}

function encryptPayload<T extends object>(payload: T): string {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

function decryptPayload<T extends object>(encrypted: string): T | null {
    try {
        const key = getEncryptionKey();
        const data = Buffer.from(encrypted, "base64url");
        const iv = data.subarray(0, IV_LENGTH);
        const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return JSON.parse(decrypted.toString("utf8")) as T;
    } catch {
        return null;
    }
}

function encryptMfaPayload(payload: MfaPendingPayload): string {
    return encryptPayload(payload);
}

function decryptMfaPayload(encrypted: string): MfaPendingPayload | null {
    return decryptPayload<MfaPendingPayload>(encrypted);
}

async function setMfaCookie(payload: MfaPendingPayload): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(MFA_COOKIE_NAME, encryptMfaPayload(payload), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MFA_COOKIE_MAX_AGE,
        path: "/",
    });
}

async function consumeMfaCookie(): Promise<MfaPendingPayload | null> {
    const cookieStore = await cookies();
    const value = cookieStore.get(MFA_COOKIE_NAME)?.value;
    if (!value) return null;
    cookieStore.delete(MFA_COOKIE_NAME);
    return decryptMfaPayload(value);
}

// ---------------------------------------------------------------------------
// PKCE state cookie helpers
// ---------------------------------------------------------------------------

const PKCE_COOKIE_NAME = "pkce_state";
const PKCE_COOKIE_MAX_AGE = 10 * 60; // 10 minutes

async function setPkceStateCookie(payload: PkceStatePayload): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(PKCE_COOKIE_NAME, encryptPayload(payload), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: PKCE_COOKIE_MAX_AGE,
        path: "/",
    });
}

async function consumePkceStateCookie(requestId: string): Promise<PkceStatePayload | null> {
    const cookieStore = await cookies();
    const value = cookieStore.get(PKCE_COOKIE_NAME)?.value;
    if (!value) return null;
    const payload = decryptPayload<PkceStatePayload>(value);
    if (!payload || payload.requestId !== requestId) return null;
    cookieStore.delete(PKCE_COOKIE_NAME);
    return payload;
}

// ---------------------------------------------------------------------------
// Login actions
// ---------------------------------------------------------------------------

export async function initiatePkceAction(url: string): Promise<InitiatePkceResult> {
    const pkce = await initiatePkce(url);
    if (!pkce) {
        return { status: "error", message: "Failed to initiate authorization." };
    }
    await setPkceStateCookie({ requestId: pkce.requestId, codeVerifier: pkce.codeVerifier, serverUrl: url });
    return { status: "success", requestId: pkce.requestId };
}

export async function loginAction(email: string, password: string, url: string, requestId?: string): Promise<LoginActionResult> {
    let result;

    if (requestId) {
        const pkceState = await consumePkceStateCookie(requestId);
        if (pkceState) {
            result = await loginWithOAuth2(url, email, password, { requestId, codeVerifier: pkceState.codeVerifier });
        } else {
            result = await loginWithOAuth2(url, email, password);
        }
    } else {
        result = await loginWithOAuth2(url, email, password);
    }

    if (!result) {
        return { status: "error", message: "Invalid credentials." };
    }

    if ("mfaRequired" in result) {
        await setMfaCookie({ mfaToken: result.mfaToken, codeVerifier: result.codeVerifier, serverUrl: result.serverUrl });
        return { status: "mfa_required" };
    }

    return {
        status: "success",
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        userInfoJson: JSON.stringify(result.user),
        url,
    };
}

export async function completeMfaLoginAction(totpCode: string): Promise<CompleteMfaActionResult> {
    const pending = await consumeMfaCookie();

    if (!pending) {
        return { status: "error", message: "MFA session expired. Please log in again." };
    }

    const result = await completeMfaLogin(pending.serverUrl, pending.mfaToken, totpCode, pending.codeVerifier);

    if (!result) {
        // Re-set cookie so user can retry with a different code
        await setMfaCookie(pending);
        return { status: "error", message: "Invalid code. Please try again." };
    }

    return {
        status: "success",
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        userInfoJson: JSON.stringify(result.user),
        url: pending.serverUrl,
    };
}
