"use server";

import {State} from "@/app/shared/models/state";
import {auth, signIn as authSignIn} from "@/auth";
import {createUser, postUserProfilePicture} from "@/app/auth/dataAccess/usersServerClient";
import {RegisterRequest, RegisterRequestSchema} from "@/app/auth/models/authMessaging/registerRequest";
import {RegisterResponse} from "@/app/auth/models/authMessaging/registerResponse";

export async function registerUser(
    url: string,
    prevState: State,
    formData: FormData
): Promise<{ success: boolean; message: string; nextStep?: string | null }> {
    const validatedFields = RegisterRequestSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        roleId: "69d53e275972e07a551946dc",
    });

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data. Please check your inputs.' };
    }

    try {
        const registerRequest: RegisterRequest = validatedFields.data;

        const res : RegisterResponse | null = await createUser(url, registerRequest);
        if (!res) {
            console.error("userActions.registerUser");
            console.error("Error registering user");
            return {success : false, message : 'User not registered!'};
        }
        if (!res.user?.id) {
            console.error("Error registering user", res);
            return { success: false, message: 'User not registered!' };
        }

        return {
            success: true,
            message: 'Registration successful',
            nextStep: res.nextStep,
        };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: 'Something went wrong during registration.' };
    }
}

export async function establishSessionAfterRegister(params: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    userInfoJson: string;
    url: string;
}): Promise<{ success: boolean; message: string }> {
    try {
        await authSignIn("mfa", {
            accessToken: params.accessToken,
            refreshToken: params.refreshToken,
            expiresIn: params.expiresIn.toString(),
            userInfoJson: params.userInfoJson,
            url: params.url,
            redirect: false,
        });

        return { success: true, message: "Session established" };
    } catch (error) {
        console.error("Session establish error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to establish session.",
        };
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
