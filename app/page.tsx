'use client'

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AcmeLogo from "@/app/ui/custom/acmeLogo";
import {Card, CardContent} from "./ui/base/card";
import {Button} from "@/app/ui/base/button";
import {ThemeToggle} from "@/app/ui/custom/themeToggle";
import { useSession } from "next-auth/react";
import {useContext} from "react";
import {ThemeContext} from "@/app/lib/theme/themeContext";

export default function Home() {
    const { data: session } = useSession();
    const isLoggedIn : boolean = !!session?.user;
    const { isDark } = useContext(ThemeContext);

    return (
        <main className="flex min-h-screen flex-col p-6">
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>

            {/* Header Banner */}
            <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
                <AcmeLogo />
            </div>

            {/* Main Content */}
            <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
                {/* Welcome Card */}
                <Card className="md:w-2/5 bg-secondary border-0">
                    <CardContent className="flex flex-col justify-center gap-6 px-6 py-10 md:px-20">
                        <div className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-foreground" />
                        <p className={`text-xl text-foreground md:text-3xl md:leading-normal`}>
                            <strong>Welcome to Acme.</strong> This is the example for the{" "}
                            <a href="https://nextjs.org/learn/" className="text-blue-500 hover:underline">
                                Next.js Learn Course
                            </a>
                            , brought to you by Vercel.
                        </p>

                        { isLoggedIn ? (
                            <Button size="lg" className="self-start bg-blue-500 hover:bg-blue-400">
                                <Link href="/dashboard/">
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                                </Link>
                            </Button>
                        )
                        :
                        (
                            <Button size="lg" className="self-start bg-blue-500 hover:bg-blue-400">
                                <Link href="/auth/login/">
                                    <span>Log in</span>
                                    <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Hero Images */}
                <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
                    <Image
                        src={isDark ? "/hero-desktop-dark.jpg" : "/hero-desktop.png"}
                        width={1000}
                        height={760}
                        className="hidden md:block"
                        alt="Screenshots of the dashboard project showing desktop version"
                    />
                    <Image
                        src="/hero-mobile.png"
                        width={560}
                        height={620}
                        className="block md:hidden"
                        alt="Screenshots of the dashboard project showing mobile version"
                    />
                </div>
            </div>
        </main>
    );
}