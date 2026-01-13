"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from "@/app/ui/base/navigation-menu";
import {Button} from "@/app/ui/base/button";
import AcmeLogo from "@/app/ui/custom/acmeLogo";
import {ThemeToggle} from "@/app/ui/custom/navigation/themeToggle";
import {LanguageToggle} from "@/app/ui/custom/navigation/languageToggle";
import {useDebugTranslations} from "@/app/lib/devOverlay/useDebugTranslations";

export function Navbar() {
    const { data: session, status } = useSession();
    const isLoggedIn : boolean = !!session?.user;
    const t = useDebugTranslations("nav");

    return (
        <header className="bg-background">
            <div className="container flex h-14 items-center justify-between px-4">
                {/* Left side */}
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink href={"/"}>
                                <div className="flex h-10 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-15 mt-2">
                                    <AcmeLogo />
                                </div>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink href={"/"}>
                                {t("home")}
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {isLoggedIn && (
                            <NavigationMenuItem>
                                <NavigationMenuLink href={"/dashboard"}>
                                    {t("dashboard")}
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <LanguageToggle/>
                    <ThemeToggle/>
                    {status === "loading" ? (
                        <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
                    ) : session?.user ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {session.user.email}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => signOut({ callbackUrl: "/" })}
                            >
                                <LogOut className="size-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button variant="default" size="sm">
                            <Link href="/auth/login">{t("login")}</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}