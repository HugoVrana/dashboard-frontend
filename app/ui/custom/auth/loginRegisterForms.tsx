"use client";

import {Suspense, useState} from "react";
import {Button} from "@/app/ui/base/button";
import LoginForm from "@/app/ui/custom/auth/loginForm";
import RegisterForm from "@/app/ui/custom/auth/registerForm";

export default function LoginRegisterForm() {
    const [pageState, setPageState] = useState("login");

    return (
        <Suspense>
            <div className="flex flex-col items-center justify-center min-h-screen ">
                <div className="w-full max-w-md p-8  rounded-lg shadow-md">
                    <div className="flex gap-2 mb-6">
                        <Button
                            onClick={() => setPageState("login")}
                            className={`flex-1 ${pageState === "login" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                        >
                            Login
                        </Button>
                        <Button
                            onClick={() => setPageState("register")}
                            className={`flex-1 ${pageState === "register" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                        >
                            Register
                        </Button>
                    </div>
                    {pageState === "login" ? (
                        <LoginForm/>
                    ) : (
                        <RegisterForm/>
                    )}
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Acme. All rights reserved.
                </div>
            </div>
        </Suspense>
    )
}