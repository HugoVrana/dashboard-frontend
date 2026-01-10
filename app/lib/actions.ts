"use server"

import {mapToInvoiceCreate, mapToInvoiceUpdate} from "@/app/typeValidators/invoiceValidator";
import {InvoiceRead} from "@/app/models/invoice/invoiceRead";
import {InvoiceCreate} from "@/app/models/invoice/invoiceCreate";
import {InvoiceUpdate} from "@/app/models/invoice/invoiceUpdate";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {State} from "@/app/models/state";
import {InvoiceCreateFormSchema} from "@/app/models/invoice/invoiceCreateFormSchema";
import {InvoiceUpdateFormSchema} from "@/app/models/invoice/invoiceUpdateFormSchema";
import {InvoiceDeleteFormSchema} from "@/app/models/invoice/InvoiceDeleteFormSchema";
import {signIn, signOut} from '@/auth';
import {z} from "zod";
import {RegisterRequest} from "@/app/models/auth/registerRequest";
import {UserInfo} from "@/app/models/auth/userInfo";
import {AuthError} from "@auth/core/errors";
import {isRedirectError} from "next/dist/client/components/redirect-error";
import {deleteInvoice, postInvoice, putInvoice} from "@/app/lib/dataAccess/invoiceServerClient";
import {createUser} from "@/app/lib/dataAccess/usersServerClient";

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
    redirect('/dashboard/invoices');
}

export async function updateInvoice(url : string, prevState : State, formData : FormData) : Promise<State> {

    const validatedFields= InvoiceUpdateFormSchema.safeParse({
        invoice_id : formData.get('invoiceId'),
        customer_id: formData.get('customer_id'),
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
        let res : InvoiceRead | null = await putInvoice(url + "/" + invoiceUpdate.invoice_id, invoiceUpdate);
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

export async function login(url: string, prevState: any, formData: FormData): Promise<State> {
    console.log("Logging in user");

    const validatedFields = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        redirectTo: z.string().optional()
    }).safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: formData.get('redirectTo')
    });

    if (!validatedFields.success) {
        try{

        }
        catch (e) {}

        return { message: 'Invalid form data. Please check your inputs.' };
    }

    const { email, password, redirectTo } = validatedFields.data;

    try {
        // Log successful login attempt


        // signIn will throw a redirect on success, which we need to let through
        await signIn('credentials', {
            email,
            password,
            url,
            redirectTo: redirectTo || '/dashboard',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':

                    return { message: 'Invalid credentials.' };
                default:

                    return { message: 'Something went wrong.' };
            }
        }
        // Only re-throw redirect errors, not everything
        if (isRedirectError(error)) {
            throw error;
        }

        // Log unexpected errors instead of re-throwing
        return { message: 'Something went wrong.' };
    }

    // This line will never be reached because signIn with redirectTo will throw a redirect
    return { message: 'Login successful' };
}

export async function register(url: string, prevState: State | undefined, formData: FormData): Promise<State> {
    console.log("Registering user");

    // Validate the form data
    const validatedFields = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    }).safeParse({
        email: formData.get('email'),
        password: formData.get('password')
    });

    if (!validatedFields.success) {

        return { message: 'Invalid form data. Please check your inputs.'};
    }

    const { email, password } = validatedFields.data;

    try {
        let registerRequest : RegisterRequest = {
            email : email,
            password : password,
            roleId : "693950e2bf5065eaf5737136"
        }

        let res : UserInfo | null = await createUser(url, registerRequest);
        if (!res) {
            console.error("Error registering an user", res);
            return { message: 'User not registered!'};
        }

        if (!res.id) {
            console.error("Error registering an user", res);
            return { message: 'User not registered!'};
        }

        // Automatically sign in the user after successful registration
        // signIn will throw a redirect on success, which we need to let through
        await signIn('credentials', {
            email,
            password,
            url,
            redirectTo: '/dashboard',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            console.error("Registration error:", error);
            return {
                message: 'User registered but login failed. Please try logging in manually.',
            };
        }
        // Re-throw to allow NextAuth redirects to work
        throw error;
    }

    // This line will never be reached because signIn with redirectTo will throw a redirect
    return { message: 'Registration successful' };
}

export async function logout(url: string, prevState: State | undefined, formData : FormData) {
    // Just call signOut - the event handler will take care of backend logout
    await signOut({ redirectTo: '/' });
}