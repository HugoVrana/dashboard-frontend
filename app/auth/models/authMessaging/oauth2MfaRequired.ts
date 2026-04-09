import {z} from "zod";

export const OAuth2MfaRequiredSchema = z.object({
    mfaRequired: z.literal(true),
    mfaToken: z.string(),
    codeVerifier: z.string(),
    serverUrl: z.string(),
});

export type OAuth2MfaRequired = z.infer<typeof OAuth2MfaRequiredSchema>;
