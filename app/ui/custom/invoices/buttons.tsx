import { Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { removeInvoice } from "@/app/lib/actions";
import { useActionState, useContext } from "react";
import { State } from "@/app/models/state";
import { Button } from "../../base/button";
import {getDashboardLocalUrl, getDashboardRenderUrl} from "@/app/lib/devOverlay/dashboardApiContext";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";

export function CreateInvoice() {
    return (
        <Button>
            <Link href="/dashboard/invoices/create">
                <span className="hidden md:block">Create Invoice</span>
                <Plus className="h-5 w-5 md:ml-4" />
            </Link>
        </Button>
    );
}

export function UpdateInvoice({ invoiceId }: { invoiceId: string }) {
    return (
        <Button variant="outline" size="icon">
            <Link href={`/dashboard/invoices/${invoiceId}/edit`}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Link>
        </Button>
    );
}

export function DeleteInvoice({ invoiceId }: { invoiceId: string }) {
    const { dashboardApiIsLocal, isReady: apiContextReady } = useContext(ApiContext);
    const initialState: State = { message: '', errors: {} };
    const url: string = dashboardApiIsLocal ? getDashboardLocalUrl() : getDashboardRenderUrl();
    const removeInvoiceWithUrl: (prevState: State, formData: FormData) => Promise<State> = removeInvoice.bind("", url);
    const [state, formAction] = useActionState(removeInvoiceWithUrl, initialState);

    return (
        <form action={formAction}>
            <input type="hidden" name="id" value={invoiceId} />
            <Button type="submit" variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </form>
    );
}