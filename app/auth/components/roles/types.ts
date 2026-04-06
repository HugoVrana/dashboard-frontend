import type {GrantRead} from "@/app/auth/models/grant/grantRead";
import type {RoleRead} from "@/app/auth/models/role/roleRead";

export type FlashState = {
    tone: "success" | "error";
    message: string;
} | null;

export type GrantDrafts = Record<string, {name: string; description: string}>;

export type RolesSelection = {
    selectedRole: RoleRead | null;
    assignedGrantIds: Set<string>;
    assignedGrants: GrantRead[];
};
