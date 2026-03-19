"use server"

import {State} from "@/app/shared/models/state";
import {InvoiceCreateFormSchema} from "@/app/dashboard/models/invoiceCreateFormSchema";
import {InvoiceCreate} from "@/app/dashboard/models/invoiceCreate";
import {mapToInvoiceCreate, mapToInvoiceUpdate} from "@/app/dashboard/typeValidators/invoiceValidator";
import {InvoiceRead} from "@/app/dashboard/models/invoiceRead";
import {deleteInvoice, postInvoice, putInvoice} from "@/app/dashboard/dataAccess/invoiceServerClient";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {InvoiceUpdateFormSchema} from "@/app/dashboard/models/invoiceUpdateFormSchema";
import {InvoiceUpdate} from "@/app/dashboard/models/invoiceUpdate";
import {InvoiceDeleteFormSchema} from "@/app/dashboard/models/InvoiceDeleteFormSchema";

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