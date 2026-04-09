import type {RoleRead} from "@/app/auth/models/role/roleRead";

export type RolesLibraryCardProps = {
    roles: RoleRead[];
    filteredRoles: RoleRead[];
    loading: boolean;
    roleSearch: string;
    selectedRoleId: string | null;
    onRoleSearchChange: (value: string) => void;
    onRoleSelect: (roleId: string) => void;
};
