import {type RoleRead, RoleReadSchema} from "@/app/models/auth/role";

export function isRole(x: unknown): x is RoleRead {
    return RoleReadSchema.safeParse(x).success;
}

export function mapToRole(x: unknown): RoleRead | null {
    const result = RoleReadSchema.safeParse(x);
    return result.success ? result.data : null;
}
