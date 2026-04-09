export type CompleteMfaActionResult =
    | { status: "success"; accessToken: string; refreshToken: string; expiresIn: number; userInfoJson: string; url: string }
    | { status: "error"; message: string };
