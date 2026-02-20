import { Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { removeInvoice } from "@/app/lib/actions";
import { useActionState, useContext } from "react";
import { State } from "@/app/models/state";
import { Button } from "../../base/button";
import {getDashboardLocalUrl, getDashboardRenderUrl} from "@/app/lib/devOverlay/dashboardApiContext";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";

export function CreateInvoice() {
    const t = useDebugTranslations("dashboard.controls.invoiceButtons");
    return (
        <Button>
            <Link href="/dashboard/invoices/create/" className="hidden md:inline-flex items-center gap-2">
                {t('createInvoice')} <Plus className="h-5 w-5" />
            </Link>
        </Button>
    );
}

export function UpdateInvoice({ invoiceId }: { invoiceId: string }) {
    const t = useDebugTranslations("dashboard.controls.invoiceButtons");
    return (
        <Button variant="outline" size="icon">
            <Link href={`/dashboard/invoices/${invoiceId}/edit`}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{t('editInvoice')}</span>
            </Link>
        </Button>
    );
}

export function DeleteInvoice({ invoiceId }: { invoiceId: string }) {
    const t = useDebugTranslations("dashboard.controls.invoiceButtons");
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
                <span className="sr-only">{t('deleteInvoice')}</span>
            </Button>
        </form>
    );
}