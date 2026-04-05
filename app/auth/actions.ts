"use server";

import {State} from "@/app/shared/models/state";
import {RegisterRequest} from "@/app/auth/models/registerRequest";
import {UserInfo} from "@/app/auth/models/userInfo";
import {auth} from "@/auth";
import {TotpSetupResponse} from "@/app/auth/models/totpSetupResponse";
import {createUser, postUserProfilePicture, setupTotp, verifyTotp} from "@/app/auth/dataAccess/usersServerClient";
import {z} from "zod";
import {loginWithOAuth2, completeMfaLogin, initiatePkce} from "@/app/auth/oauth2";
import {cookies} from "next/headers";
import {createCipheriv, createDecipheriv, createHash, randomBytes} from "crypto";

// ---------------------------------------------------------------------------
// MFA pending cookie helpers
// ---------------------------------------------------------------------------

const MFA_COOKIE_NAME = "mfa_pending";
const MFA_COOKIE_MAX_AGE = 5 * 60; // 5 minutes
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

interface MfaPendingPayload {
    mfaToken: string;
    codeVerifier: string;
    serverUrl: string;
}

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

interface PkceStatePayload {
    requestId: string;
    codeVerifier: string;
    serverUrl: string;
}

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

export type LoginActionResult =
    | { status: "success"; accessToken: string; refreshToken: string; expiresIn: number; userInfoJson: string; url: string }
    | { status: "mfa_required" }
    | { status: "error"; message: string };

export type InitiatePkceResult =
    | { status: "success"; requestId: string }
    | { status: "error"; message: string };

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

export type CompleteMfaActionResult =
    | { status: "success"; accessToken: string; refreshToken: string; expiresIn: number; userInfoJson: string; url: string }
    | { status: "error"; message: string };

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

export async function registerUser(url: string, prevState: State, formData: FormData): Promise<{ success: boolean; message: string }> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validatedFields = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    }).safeParse({ email, password });

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data. Please check your inputs.' };
    }

    try {
        const registerRequest: RegisterRequest = {
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            roleId: "693950e2bf5065eaf5737136"
        };

        const res : UserInfo | null = await createUser(url, registerRequest);
        if (!res) {
            console.error("Error registering user");
            return {success : false, message : 'User not registered!'};
        }
        if (!res.id) {
            console.error("Error registering user", res);
            return { success: false, message: 'User not registered!' };
        }

        return { success: true, message: 'Registration successful' };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: 'Something went wrong during registration.' };
    }
}

export async function setProfilePicture(formData: FormData): Promise<{ success: boolean; message: string; url?: string }> {
    console.log("setProfilePicture: Starting upload");

    const session = await auth();
    console.log("setProfilePicture: Session retrieved:", session ? "yes" : "no");

    if (!session) {
        console.log("setProfilePicture: No session found");
        return { success: false, message: 'Not authenticated - no session' };
    }

    if (!session.accessToken) {
        console.log("setProfilePicture: No access token in session");
        return { success: false, message: 'Not authenticated - no access token' };
    }

    if (!session.url) {
        console.log("setProfilePicture: No URL in session");
        return { success: false, message: 'Not authenticated - no URL' };
    }

    console.log("setProfilePicture: Session valid, URL:", session.url);

    const file = formData.get('file') as File | null;
    if (!file) {
        return { success: false, message: 'No file provided' };
    }

    try {
        const publicUrl = await postUserProfilePicture(session.url, session.accessToken, file);

        if (!publicUrl) {
            return { success: false, message: 'Failed to upload profile picture' };
        }

        return { success: true, message: 'Profile picture uploaded', url: publicUrl };
    } catch (error) {
        console.error("Profile picture upload error:", error);
        return { success: false, message: 'Something went wrong during upload.' };
    }
}

export async function setupTotpAction(): Promise<{ success: boolean; message: string; data?: TotpSetupResponse }> {
    console.log("setupTotpAction: Starting TOTP setup");

    const session = await auth();
    console.log("setupTotpAction: Session retrieved:", session ? "yes" : "no");

    if (!session) {
        console.log("setupTotpAction: No session found");
        return { success: false, message: 'Not authenticated - no session' };
    }

    if (!session.accessToken) {
        console.log("setupTotpAction: No access token in session");
        return { success: false, message: 'Not authenticated - no access token' };
    }

    if (!session.url) {
        console.log("setupTotpAction: No URL in session");
        return { success: false, message: 'Not authenticated - no URL' };
    }

    console.log("setupTotpAction: Session valid, URL:", session.url);

    try {
        const totpResponse = await setupTotp(session.url, session.accessToken);

        if (!totpResponse) {
            return { success: false, message: 'Failed to setup TOTP' };
        }

        return { success: true, message: 'TOTP setup successful', data: totpResponse };
    } catch (error) {
        console.error("TOTP setup error:", error);
        return { success: false, message: 'Something went wrong during TOTP setup.' };
    }
}

export async function verifyTotpAction(code: string): Promise<{ success: boolean; message: string }> {
    console.log("verifyTotpAction: Verifying TOTP code");

    const session = await auth();

    if (!session || !session.accessToken || !session.url) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const isValid = await verifyTotp(session.url, session.accessToken, code);

        if (!isValid) {
            return { success: false, message: 'Invalid code. Please try again.' };
        }

        return { success: true, message: 'TOTP verified successfully' };
    } catch (error) {
        console.error("TOTP verification error:", error);
        return { success: false, message: 'Something went wrong during verification.' };
    }
}