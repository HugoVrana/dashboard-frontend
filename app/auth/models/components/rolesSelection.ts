import {RoleRead} from "@/app/auth/models/role/roleRead";
import {GrantRead} from "@/app/auth/models/grant/grantRead";

export type RolesSelection = {
    selectedRole: RoleRead | null;
    assignedGrantIds: Set<string>;
    assignedGrants: GrantRead[];
};