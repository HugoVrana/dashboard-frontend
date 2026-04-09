"use server";

import {auth} from "@/auth";
import {setupTotp, verifyTotp} from "@/app/auth/dataAccess/usersServerClient";
import {TotpSetupResponse} from "@/app/auth/models/authMessaging/totpSetupResponse";
import {TotpCodeSchema} from "@/app/auth/models/authMessaging/totpCode";

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

    const validatedFields = TotpCodeSchema.safeParse({code});

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid code. Please try again.' };
    }

    const session = await auth();

    if (!session || !session.accessToken || !session.url) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const isValid = await verifyTotp(session.url, session.accessToken, validatedFields.data.code);

        if (!isValid) {
            return { success: false, message: 'Invalid code. Please try again.' };
        }

        return { success: true, message: 'TOTP verified successfully' };
    } catch (error) {
        console.error("TOTP verification error:", error);
        return { success: false, message: 'Something went wrong during verification.' };
    }
}
