import {NextRequest, NextResponse} from "next/server";
import {signIn} from "@/auth";
import {completePkceCallbackAction} from "@/app/auth/actions/loginActions";

export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
        return NextResponse.redirect(
            new URL(`/auth/login?error=${encodeURIComponent(error ?? "callback_error")}`, request.url)
        );
    }

    const result = await completePkceCallbackAction(code);

    if (result.status !== "success") {
        return NextResponse.redirect(new URL("/auth/login?error=auth_failed", request.url));
    }

    await signIn("mfa", {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn.toString(),
        userInfoJson: result.userInfoJson,
        url: result.url,
        redirectTo: "/dashboard",
    });
}
