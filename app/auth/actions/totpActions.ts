"use server";

import {auth} from "@/auth";
import {setupTotp, verifyTotp} from "@/app/auth/dataAccess/usersServerClient";
import {TotpSetupResponse} from "@/app/auth/models/authMessaging/totpSetupResponse";
import {TotpCodeSchema} from "@/app/auth/models/authMessaging/totpCode";

export async function setupTotpAction(directCredentials?: { accessToken: string; url: string }): Promise<{
    success: boolean;
    message: string;
    data?: TotpSetupResponse;
    debug?: Record<string, string | boolean | null>;
}> {
    console.log("setupTotpAction: Starting TOTP setup");

    let accessToken: string | undefined = directCredentials?.accessToken;
    let url: string | undefined = directCredentials?.url;

    if (!accessToken || !url) {
        const session = await auth();
        console.log("setupTotpAction: Session retrieved:", session ? "yes" : "no");
        accessToken = session?.accessToken ?? undefined;
        url = session?.url ?? undefined;
    }

    const debugBase = {
        hasAccessToken: Boolean(accessToken),
        hasUrl: Boolean(url),
        accessTokenPrefix: accessToken ? accessToken.slice(0, 24) : null,
    };

    if (!accessToken) {
        console.log("setupTotpAction: No access token");
        return { success: false, message: 'Not authenticated - no access token', debug: debugBase };
    }

    if (!url) {
        console.log("setupTotpAction: No URL");
        return { success: false, message: 'Not authenticated - no URL', debug: debugBase };
    }

    console.log("setupTotpAction: Credentials valid, URL:", url);

    try {
        const totpResponse = await setupTotp(url, accessToken);

        if (!totpResponse.success || !totpResponse.data) {
            return {
                success: false,
                message: 'Failed to setup TOTP',
                debug: {
                    ...debugBase,
                    responseStatus: totpResponse.status?.toString() ?? null,
                    responseStatusText: totpResponse.statusText ?? null,
                    responseBody: totpResponse.responseBody ?? null,
                    parseError: totpResponse.parseError ?? null,
                },
            };
        }

        return {
            success: true,
            message: 'TOTP setup successful',
            data: totpResponse.data,
            debug: {
                ...debugBase,
                responseStatus: totpResponse.status?.toString() ?? null,
                responseStatusText: totpResponse.statusText ?? null,
                responseBody: totpResponse.responseBody ?? null,
                parseError: totpResponse.parseError ?? null,
            },
        };
    } catch (error) {
        console.error("TOTP setup error:", error);
        return {
            success: false,
            message: 'Something went wrong during TOTP setup.',
            debug: {
                ...debugBase,
                errorMessage: error instanceof Error ? error.message : String(error),
            },
        };
    }
}

export async function verifyTotpAction(code: string, directCredentials?: { accessToken: string; url: string }): Promise<{ success: boolean; message: string }> {
    console.log("verifyTotpAction: Verifying TOTP code");

    const validatedFields = TotpCodeSchema.safeParse({code});

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid code. Please try again.' };
    }

    let accessToken: string | undefined = directCredentials?.accessToken;
    let url: string | undefined = directCredentials?.url;

    if (!accessToken || !url) {
        const session = await auth();
        accessToken = session?.accessToken ?? undefined;
        url = session?.url ?? undefined;
    }

    if (!accessToken || !url) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const isValid = await verifyTotp(url, accessToken, validatedFields.data.code);

        if (!isValid) {
            return { success: false, message: 'Invalid code. Please try again.' };
        }

        return { success: true, message: 'TOTP verified successfully' };
    } catch (error) {
        console.error("TOTP verification error:", error);
        return { success: false, message: 'Something went wrong during verification.' };
    }
}
