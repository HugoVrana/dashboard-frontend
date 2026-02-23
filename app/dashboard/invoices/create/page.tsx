import {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import CreateContent from "./createContent";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("dashboard.invoices.create.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <CreateContent />;
}
