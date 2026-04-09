import {z} from "zod";

export const MfaPendingPayload = z.object({
    mfaToken: z.string(),
    codeVerifier: z.string(),
    serverUrl: z.string()
});

export type MfaPendingPayload = z.infer<typeof MfaPendingPayload>;