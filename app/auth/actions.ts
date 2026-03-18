import {State} from "@/app/shared/models/state";
import {RegisterRequest} from "@/app/auth/models/registerRequest";
import {UserInfo} from "@/app/auth/models/userInfo";
import {auth} from "@/auth";
import {TotpSetupResponse} from "@/app/auth/models/totpSetupResponse";
import {createUser, postUserProfilePicture, setupTotp, verifyTotp} from "@/app/auth/dataAccess/usersServerClient";
import {z} from "zod";

export async function registerUser(url: string, prevState: State, formData: FormData): Promise<{ success: boolean; message: string }> {
    console.log("Registering user");

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