import type {RoleRead} from "@/app/auth/models/role/roleRead";

export type RoleDetailCardProps = {
    selectedRole: RoleRead | null;
    assignedGrantCount: number;
    editName: string;
    loading: boolean;
    busyKey: string | null;
    canEdit: boolean;
    canDelete: boolean;
    onEditNameChange: (value: string) => void;
    onRefresh: () => void;
    onUpdateRole: (formData: FormData) => Promise<void>;
    onDeleteRole: () => Promise<void>;
};
