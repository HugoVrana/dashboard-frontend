import {z} from "zod";

const STRONG_PASSWORD_MESSAGE = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

export const RegisterRequestSchema = z.object({
    email: z.string().trim().email(),
    password: z.string()
        .min(8, STRONG_PASSWORD_MESSAGE)
        .regex(/[A-Z]/, STRONG_PASSWORD_MESSAGE)
        .regex(/[a-z]/, STRONG_PASSWORD_MESSAGE)
        .regex(/\d/, STRONG_PASSWORD_MESSAGE)
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, STRONG_PASSWORD_MESSAGE),
    roleId: z.string(),
    clientId: z.string().optional(),
});

export const RegisterFormSchema = RegisterRequestSchema.pick({
    email: true,
    password: true,
}).extend({
    confirmPassword: z.string().min(8, STRONG_PASSWORD_MESSAGE),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
