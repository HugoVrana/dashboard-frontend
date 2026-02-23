import {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import OverviewContent from "./overviewContent";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("dashboard.overview.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <OverviewContent />;
}
