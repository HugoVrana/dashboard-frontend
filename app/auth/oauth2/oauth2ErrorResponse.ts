import {z} from "zod";

/**
 * Standard OAuth2 error response (RFC 6749 §5.2).
 */
export const OAuth2ErrorResponseSchema = z.object({
    error: z.string(),
    error_description: z.string().nullable().optional(),
});

export type OAuth2ErrorResponse = z.infer<typeof OAuth2ErrorResponseSchema>;

/**
 * MFA required response from POST /v2/oauth2/authorize
 * when the user has 2FA enabled.
 */
export const MfaRequiredResponseSchema = z.object({
    mfa_required: z.literal(true),
    mfa_token: z.string(),
});

export type MfaRequiredResponse = z.infer<typeof MfaRequiredResponseSchema>;
