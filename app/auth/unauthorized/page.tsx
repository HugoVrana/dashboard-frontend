import Link from "next/link";
import {ShieldAlert} from "lucide-react";
import {getTranslations} from "next-intl/server";


type Props = {
    searchParams: Promise<{ from?: string }>;
};

export default async function Unauthorized({ searchParams } : Props) {
    const {from} = await searchParams;
    const t = await getTranslations("auth.unauthorized");

    return (
        <main className="flex h-full flex-col items-center justify-center gap-2">
            <ShieldAlert className="w-10 text-gray-400" />
            <h2 className="text-xl font-semibold">{t("title")}</h2>
            <p>{t("description")}</p>
            <div className="mt-4 flex w-48 flex-col gap-2">
                {from && from.length > 0 && (
                    <Link
                        href={from}
                        className="rounded-md bg-blue-500 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-400"
                    >
                        {t("back")}
                    </Link>
                )}
                <Link
                    href="/dashboard"
                    className="rounded-md bg-blue-500 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-400"
                >
                    {t("toDashboard")}
                </Link>
                <Link href={"/"}
                      className="rounded-md bg-blue-500 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-400">
                    {t("toHome")}
                </Link>
            </div>
        </main>
    );
}