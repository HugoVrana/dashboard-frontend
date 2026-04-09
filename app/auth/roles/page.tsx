import {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import RolesContent from "./rolesContent";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("dashboard.roles.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function Page() {
    return <RolesContent />;
}
