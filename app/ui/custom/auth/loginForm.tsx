"use client";

import {CardTitle} from "@/app/ui/base/card";
import {Label} from "@/app/ui/base/label";
import {Input} from "@/app/ui/base/input";
import {ArrowRightIcon, AtSign, FileExclamationPointIcon, KeyIcon} from "lucide-react";
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

    const loginWithIsLocal: (prevState: any, formData: FormData) => Promise<any> = login.bind(null, url);
    const callbackUrl : string = searchParams.get('callbackUrl') || '/dashboard';
    const [errorMessage, formAction, isPending] = useActionState(
        loginWithIsLocal,
        undefined,
    );

  return(
      <form action={formAction} className="space-y-4">
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

        <Button className="w-full" aria-disabled={isPending}>
          Log in
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
          <div
              className="flex h-8 items-end space-x-1"
              aria-live="polite"
              aria-atomic="true">
              {errorMessage && (
                  <>
                      <FileExclamationPointIcon className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-500">{errorMessage}</p>
                  </>
              )}
          </div>
      </form>
  );
}