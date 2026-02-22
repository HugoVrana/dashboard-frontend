"use server"

import {isInvoiceUpdate, mapToInvoiceCreate, mapToInvoiceUpdate} from "@/app/lib/typeValidators/invoiceValidator";
import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {InvoiceCreate} from "@/app/models/invoice/invoiceCreate";
import {InvoiceUpdate} from "@/app/models/invoice/invoiceUpdate";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {State} from "@/app/models/state";
import {InvoiceCreateFormSchema} from "@/app/models/invoice/invoiceCreateFormSchema";
import {InvoiceUpdateFormSchema} from "@/app/models/invoice/invoiceUpdateFormSchema";
import {InvoiceDeleteFormSchema} from "@/app/models/invoice/InvoiceDeleteFormSchema";
import {z} from "zod";
import {RegisterRequest} from "@/app/models/auth/registerRequest";
import {UserInfo} from "@/app/models/auth/userInfo";
import {deleteInvoice, postInvoice, putInvoice} from "@/app/lib/dataAccess/invoiceServerClient";
import {createUser, postUserProfilePicture} from "@/app/lib/dataAccess/usersServerClient";
import {auth} from "@/auth";

export async function createInvoice(url: string, prevState: State, formData: FormData) : Promise<State> {
    console.log("Creating invoice step 1");
    const validatedFields = InvoiceCreateFormSchema.safeParse({
        customer_id: formData.get('customer_id'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if (!validatedFields.success) {
        console.error("Invalid form data", validatedFields.error);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    let invoiceCreate : InvoiceCreate | null = mapToInvoiceCreate(validatedFields.data);
    if (invoiceCreate == null) {
        console.error("Object could not be mapped to InvoiceCreate");
        return {
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    try {
        console.log("Server Action reached");
        let res : InvoiceRead | null = await postInvoice(url, invoiceCreate);
        if (res?.id == null){
            return {
                message : "Failed to create invoice. Please try again.",
            }
        }
        console.log("Invoice created successfully!");
        console.log(res);
    } catch (e) {
        console.error("Error creating invoice:", e);
        return {
            message : "Failed to create invoice. Please try again.",
        }
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices?created=true');
}

export async function updateInvoice(url : string, prevState : State, formData : FormData) : Promise<State> {

    const validatedFields= InvoiceUpdateFormSchema.safeParse({
        id : formData.get('id'),
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if (!validatedFields.success) {
        console.error("Invalid form data", validatedFields.error);
        throw new Error(validatedFields.error.message);
    }

    let invoiceUpdate : InvoiceUpdate | null = mapToInvoiceUpdate(validatedFields.data);
    if (invoiceUpdate == null) {
        console.error("Object could not be mapped to InvoiceUpdate");
        throw new Error("Object could not be mapped to InvoiceUpdate");
    }

    try {
        console.log("Server Action reached");
        let res : InvoiceRead | null = await putInvoice(url, invoiceUpdate);
        if (res?.id == null){
            throw new Error("Failed to create invoice. Please try again.");
        }
        console.log("Invoice created successfully!");
        console.log(res);
    } catch (e) {
        console.error("Error creating invoice:", e);
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function removeInvoice(url : string, prevState : State, formData : FormData) {
    const validatedFields = InvoiceDeleteFormSchema.safeParse({
        invoiceId : formData.get('id')
    });

    if (!validatedFields.success) {
        console.error("Invalid form data", validatedFields.error);
        throw new Error(validatedFields.error.message);
    }

    let invoiceId : string = validatedFields.data.invoiceId;
    if (invoiceId == null) {

        console.error("Invalid invoice id");
        throw new Error("Invalid invoice id");
    }

    try{
        console.log("Server Action reached");
        let res : number = await deleteInvoice(url, invoiceId);
        if (res == 0){
            throw new Error("Failed to delete invoice. Please try again.");
        }

        console.log("Invoice deleted successfully!");
        console.log(res);
    }
    catch (e) {
        console.error("Error deleting invoice:", e);
        return { message: 'Database Error: Failed to Delete Invoice.' };
    }
    revalidatePath('dashboard/invoices');
    redirect("/dashboard/invoices");
}

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