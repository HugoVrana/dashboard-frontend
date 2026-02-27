import {type GrantRead, GrantReadSchema} from "@/app/models/auth/grantRead";

export function isGrantRead(x: unknown): x is GrantRead {
    return GrantReadSchema.safeParse(x).success;
}

export function mapToGrantRead(x: unknown): GrantRead | null {
    const result = GrantReadSchema.safeParse(x);
    return result.success ? result.data : null;
}
