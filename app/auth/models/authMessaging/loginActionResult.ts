export type LoginActionResult =
    | { status: "success"; accessToken: string; refreshToken: string; expiresIn: number; userInfoJson: string; url: string }
    | { status: "mfa_required" }
    | { status: "error"; message: string };
