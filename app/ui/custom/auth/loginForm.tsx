"use client";

import {CardTitle} from "@/app/ui/base/card";
import {Label} from "@/app/ui/base/label";
import {Input} from "@/app/ui/base/input";
import {ArrowRightIcon, AtSign, KeyIcon, ShieldAlert} from "lucide-react";
import {Button} from "@/app/ui/base/button";
import {login} from "@/app/lib/actions";
import {useActionState, useContext} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/lib/devOverlay/dashboardAuthApiContext";
import {useSearchParams} from "next/navigation";

export default function LoginForm() {
    const searchParams = useSearchParams();
    const { dashboardAuthApiIsLocal } = useContext(ApiContext);

    const url : string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
    const callbackUrl : string = searchParams.get('callbackUrl') || '/dashboard';

    const loginAction = login.bind(null, url);
    const [loginError, loginFormAction, loginPending] = useActionState(loginAction, undefined);

  return(
      <form action={loginFormAction} className="space-y-4">
        <CardTitle className="text-xl">Welcome back</CardTitle>

        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Input
                id="login-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                className="pl-10"
                required
            />
            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter password"
                className="pl-10"
                required
                minLength={6}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <Input type="hidden" name="redirectTo" value={callbackUrl} />

        <Button className="w-full" type={"submit"} disabled={loginPending}>
          Log in
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>

        {loginError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
                <ShieldAlert className="h-4 w-4" />
                <span>{loginError.message}</span>
            </div>
        )}
      </form>
  );
}