import {z} from "zod";

/**
 * Standard OAuth2 token response (RFC 6749 §5.1).
 * Maps the snake_case JSON from the backend's V2 token endpoint.
 */
export const OAuth2TokenResponseSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
    refresh_token: z.string(),
});

export type OAuth2TokenResponse = z.infer<typeof OAuth2TokenResponseSchema>;
