"use client";

import * as React from "react";
import { useContext } from "react";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { ThemeContext } from "@/app/lib/theme/themeContext";
import { ThemeToggle } from "@/app/ui/custom/themeToggle";
import {signOut} from "next-auth/react";
import {getUserEmail} from "@/app/lib/permission/permissionsClient";
import {ChevronDown} from "lucide-react";
import {cn} from "@/app/lib/utils";

export default function DashboardNavigationMenu() {
    const { isDark } = useContext(ThemeContext);
    const userEmail : string = getUserEmail();
    console.log("User email: " + userEmail);
    const loggedIn : boolean = userEmail != "";

    const colors = {
        trigger: isDark
            ? "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 active:bg-zinc-800 data-[popup-open]:bg-zinc-800"
            : "bg-gray-50 text-gray-900 hover:bg-gray-100 active:bg-gray-100 data-[popup-open]:bg-gray-100",
        popup: isDark
            ? "bg-zinc-950 text-zinc-100 shadow-none outline-zinc-800"
            : "bg-white text-gray-900 shadow-lg shadow-gray-200 outline-gray-200",
        linkCard: isDark ? "hover:bg-zinc-900" : "hover:bg-gray-100",
        mutedText: isDark ? "text-zinc-400" : "text-gray-500",
        arrowBorder: isDark ? "fill-none" : "fill-gray-200",
        arrowFill: isDark ? "fill-zinc-950" : "fill-white",
        logoutButton: isDark
            ? "text-red-400 hover:bg-zinc-800"
            : "text-red-600 hover:bg-gray-100",
    };

    const triggerClassName = cn(
        "box-border flex items-center justify-center gap-1.5 h-10",
        "px-2 xs:px-3.5 m-0 rounded-md font-medium",
        "text-[0.925rem] xs:text-base leading-6 select-none no-underline",
        "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 focus-visible:relative",
        colors.trigger
    );

    const contentClassName =
        "w-[calc(100vw_-_40px)] h-full p-6 xs:w-max xs:min-w-[400px] xs:w-max " +
        "transition-[opacity,transform,translate] duration-[var(--duration)] ease-[var(--easing)] " +
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 " +
        "data-[starting-style]:data-[activation-direction=left]:translate-x-[-50%] " +
        "data-[starting-style]:data-[activation-direction=right]:translate-x-[50%] " +
        "data-[ending-style]:data-[activation-direction=left]:translate-x-[50%] " +
        "data-[ending-style]:data-[activation-direction=right]:translate-x-[-50%]";

    const linkCardClassName = cn(
        "block rounded-md p-2 xs:p-3 no-underline text-inherit",
        "focus-visible:relative focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800",
        colors.linkCard
    );

    return (
        <NavigationMenu.Root className="relative z-50 w-full rounded-lg">
            <NavigationMenu.List className="relative flex items-center gap-2">
                {/* Left side nav items */}
                <NavigationMenu.Item>
                    <NavigationMenu.Trigger className={triggerClassName}>
                        Overview
                        <NavigationMenu.Icon className="transition-transform duration-200 ease-in-out data-[popup-open]:rotate-180">
                            <ChevronDown />
                        </NavigationMenu.Icon>
                    </NavigationMenu.Trigger>

                    <NavigationMenu.Content className={contentClassName}>
                        <ul className="grid list-none grid-cols-1 gap-0 xs:grid-cols-[12rem_12rem]">
                            {overviewLinks.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className={linkCardClassName}>
                                        <h3 className="m-0 mb-1 text-base leading-5 font-medium">
                                            {item.title}
                                        </h3>
                                        <p className={cn("m-0 text-sm leading-5", colors.mutedText)}>
                                            {item.description}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </NavigationMenu.Content>
                </NavigationMenu.Item>

                <NavigationMenu.Item>
                    <NavigationMenu.Trigger className={triggerClassName}>
                        Handbook
                        <NavigationMenu.Icon className="transition-transform duration-200 ease-in-out data-[popup-open]:rotate-180">
                            <ChevronDown />
                        </NavigationMenu.Icon>
                    </NavigationMenu.Trigger>

                    <NavigationMenu.Content className={contentClassName}>
                        <ul className="flex max-w-[400px] flex-col justify-center">
                            {handbookLinks.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className={linkCardClassName}>
                                        <h3 className="m-0 mb-1 text-base leading-5 font-medium">
                                            {item.title}
                                        </h3>
                                        <p className={cn("m-0 text-sm leading-5", colors.mutedText)}>
                                            {item.description}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </NavigationMenu.Content>
                </NavigationMenu.Item>

                <NavigationMenu.Item>
                    <a className={triggerClassName} href="https://github.com/mui/base-ui">
                        GitHub
                    </a>
                </NavigationMenu.Item>

                {/* Spacer to push right items */}
                <div className="flex-1" />

                {/* Right side: Theme toggle and User menu */}
                <ThemeToggle />

                {loggedIn && (
                    <NavigationMenu.Item>
                        <NavigationMenu.Trigger className={triggerClassName}>
                            <UserIcon />
                            <span className="hidden sm:inline max-w-37.5 truncate">
                                {userEmail}
                            </span>
                            <NavigationMenu.Icon className="transition-transform duration-200 ease-in-out data-popup-open:rotate-180">
                                <ChevronDown />
                            </NavigationMenu.Icon>
                        </NavigationMenu.Trigger>
                        <NavigationMenu.Content className={contentClassName}>
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <div className="px-3 py-2">
                                    <p className={cn("text-xs", colors.mutedText)}>Signed in as</p>
                                    <p className="text-sm font-medium truncate">{userEmail}</p>
                                </div>
                                <hr className={cn("border-t", isDark ? "border-zinc-800" : "border-gray-200")} />
                                <button
                                    onClick={() => signOut({ redirectTo: "/" })}
                                    className={cn(
                                        "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-left",
                                        "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800",
                                        colors.logoutButton
                                    )}>
                                    <LogoutIcon />
                                    Sign out
                                </button>
                            </div>
                        </NavigationMenu.Content>
                    </NavigationMenu.Item>
                )}

                {!loggedIn && (
                    <Link href="/auth/login">Sign in</Link>
                )}
            </NavigationMenu.List>

            <NavigationMenu.Portal>
                <NavigationMenu.Positioner
                    sideOffset={10}
                    collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
                    collisionAvoidance={{ side: "none" }}
                    className="box-border h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-[instant]:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5"
                    style={{
                        ["--duration" as string]: "0.35s",
                        ["--easing" as string]: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                >
                </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
        </NavigationMenu.Root>
    );
}

function Link(props: NavigationMenu.Link.Props) {
    return <NavigationMenu.Link render={<a />} {...props} />;
}

function UserIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function LogoutIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

const overviewLinks = [
    { href: "/react/overview/quick-start", title: "Quick Start", description: "Install and assemble your first component." },
    { href: "/react/overview/accessibility", title: "Accessibility", description: "Learn how we build accessible components." },
    { href: "/react/overview/releases", title: "Releases", description: "See what's new in the latest Base UI versions." },
    { href: "/react/overview/about", title: "About", description: "Learn more about Base UI and our mission." },
] as const;

const handbookLinks = [
    { href: "/react/handbook/styling", title: "Styling", description: "Base UI components can be styled with plain CSS, Tailwind CSS, CSS-in-JS, or CSS Modules." },
    { href: "/react/handbook/animation", title: "Animation", description: "Base UI components can be animated with CSS transitions, CSS animations, or JavaScript libraries." },
    { href: "/react/handbook/composition", title: "Composition", description: "Base UI components can be replaced and composed with your own existing components." },
] as const;