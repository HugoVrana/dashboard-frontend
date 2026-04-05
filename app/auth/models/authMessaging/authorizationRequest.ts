import {z} from "zod";

export const AuthorizationRequestSchema = z.object({
    id: z.string(),
    clientId: z.string(),
    redirectUri: z.string(),
    codeChallenge: z.string(),
    codeChallengeMethod: z.string(),
    scope: z.string(),
    state: z.string(),
    used: z.boolean(),
    expiryDate: z.string().transform((val) => new Date(val)),
    audit: z.unknown().optional(),
});

export type AuthorizationRequest = z.infer<typeof AuthorizationRequestSchema>;
