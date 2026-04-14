import {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import Link from "next/link";
import {CheckCircle, MailX, ShieldAlert} from "lucide-react";
import {EmailVerificationResult, verifyEmail} from "@/app/auth/dataAccess/emailVerificationServerClient";
import {getDashboardAuthRenderUrl} from "@/app/auth/dashboardAuthApiContext";

type Props = {
    searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("auth.verifyEmail.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function VerifyEmailPage({searchParams}: Props) {
    const {token} = await searchParams;
    const t = await getTranslations("auth.verifyEmail");

    if (!token) {
        return (
            <main className="flex h-full flex-col items-center justify-center gap-4">
                <MailX className="w-12 text-gray-400"/>
                <h2 className="text-xl font-semibold">{t("errorTitle")}</h2>
                <p className="max-w-sm text-center text-gray-500">{t("missingToken")}</p>
                <Link
                    href="/auth/login"
                    className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
                >
                    {t("toLogin")}
                </Link>
            </main>
        );
    }

    const serverUrl : string = getDashboardAuthRenderUrl(); // using render since we don't necessarily have context here
    const result : EmailVerificationResult = await verifyEmail(serverUrl, token);

    if (!result.success) {
        const isExpiredOrInvalid : boolean = result.status === 400 || result.status === 404 || result.status === 410;

        return (
            <main className="flex h-full flex-col items-center justify-center gap-4">
                <ShieldAlert className="w-12 text-gray-400"/>
                <h2 className="text-xl font-semibold">{t("errorTitle")}</h2>
                <p className="max-w-sm text-center text-gray-500">
                    {isExpiredOrInvalid ? t("errorExpired") : t("errorGeneric")}
                </p>
                <Link
                    href="/auth/login"
                    className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
                >
                    {t("toLogin")}
                </Link>
            </main>
        );
    }

    return (
        <main className="flex h-full flex-col items-center justify-center gap-4">
            <CheckCircle className="w-12 text-green-500"/>
            <h2 className="text-xl font-semibold">{t("successTitle")}</h2>
            <p className="max-w-sm text-center text-gray-500">{t("successDescription")}</p>
            <Link
                href="/auth/login"
                className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
            >
                {t("toLogin")}
            </Link>
        </main>
    );
}
