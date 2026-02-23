import LoginRegisterForm from "@/app/ui/custom/auth/loginRegisterForm";
import {Metadata} from "next";
import {getTranslations} from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("auth.login.meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}


export default function LoginPage() {
    return (
        <main className="flex items-center justify-center md:h-screen">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col p-4">
                <div className="-mt-4">
                    <LoginRegisterForm />
                </div>
            </div>
        </main>
    );
}