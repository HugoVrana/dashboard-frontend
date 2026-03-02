import {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import InvoicesContent from "./invoicesContent";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("dashboard.invoices.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <InvoicesContent />;
}