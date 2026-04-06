import {z} from "zod";

export const RegisterRequestSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(6),
    roleId: z.string(),
    clientId: z.string().optional(),
});

export const RegisterFormSchema = RegisterRequestSchema.pick({
    email: true,
    password: true,
}).extend({
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
