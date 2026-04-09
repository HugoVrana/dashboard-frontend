import {z} from "zod";

export const TotpCodeSchema = z.object({
    code: z.string().regex(/^\d{6}$/, "Code must be 6 digits."),
});

export type TotpCode = z.infer<typeof TotpCodeSchema>;
