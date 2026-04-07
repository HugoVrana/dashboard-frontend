import type {GrantRead} from "@/app/auth/models/grant/grantRead";
import type {RoleRead} from "@/app/auth/models/role/roleRead";
import {GrantDrafts} from "@/app/auth/models/components/grandDrafts";

export type RoleGrantsCardProps = {
    selectedRole: RoleRead | null;
    assignedGrantIds: Set<string>;
    assignedGrants: GrantRead[];
    visibleGrants: GrantRead[];
    grantDrafts: GrantDrafts;
    grantSearch: string;
    busyKey: string | null;
    canManageRoleGrants: boolean;
    canUpdateGrant: boolean;
    canDeleteGrant: boolean;
    onGrantSearchChange: (value: string) => void;
    onGrantDraftChange: (grantId: string, patch: {name?: string; description?: string}) => void;
    onGrantMutation: (grantId: string, assigned: boolean) => Promise<void>;
    onUpdateGrant: (grantId: string) => Promise<void>;
    onDeleteGrant: (grantId: string) => Promise<void>;
};
