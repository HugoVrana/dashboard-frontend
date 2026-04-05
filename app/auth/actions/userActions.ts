"use server";

import {State} from "@/app/shared/models/state";
import {auth} from "@/auth";
import {createUser, postUserProfilePicture} from "@/app/auth/dataAccess/usersServerClient";
import {z} from "zod";
import {RegisterRequest} from "@/app/auth/models/authMessaging/registerRequest";
import {UserInfo} from "@/app/auth/models/user/userInfo";

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
