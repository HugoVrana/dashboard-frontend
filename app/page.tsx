import {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import HomeContent from "@/app/homeContent";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("homepage.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Home() {
    return <HomeContent />;
}
