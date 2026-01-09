"use client"

import LoginRegisterForm from "@/app/ui/custom/auth/loginRegisterForm";

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