"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";
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
import {Avatar, AvatarImage, AvatarFallback} from "@/app/ui/base/avatar";

export function Navbar() {
    const { data: session, status } = useSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const isLoggedIn: boolean = !!session?.user;
    const t = useDebugTranslations("nav");

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await signOut({ callbackUrl: "/" });
    };

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
                            <>
                                <NavigationMenuItem>
                                    <NavigationMenuLink href={"/dashboard"}>
                                        {t("dashboard")}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink href={"/dashboard/invoices"}>
                                        {t("invoices")}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </>
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
                            <Avatar size="sm">
                                {session.user.image ? (
                                    <AvatarImage src={session.user.image} alt={session.user.email ?? "User"} />
                                ) : null}
                                <AvatarFallback>
                                    {session.user.email?.charAt(0).toUpperCase() ?? "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                                {session.user.email}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <LogOut className="size-4" />
                                )}
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