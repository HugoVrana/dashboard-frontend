import {z} from "zod";

export const PkceStatePayload = z.object({
    requestId : z.string(),
    codeVerifier : z.string(),
    serverUrl : z.string()
});

export type PkceStatePayload = z.infer<typeof PkceStatePayload>;