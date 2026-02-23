import {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import InvoiceDetailContent from "./invoiceDetailContent";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("dashboard.invoices.detail.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <InvoiceDetailContent id={params.id} />;
}
