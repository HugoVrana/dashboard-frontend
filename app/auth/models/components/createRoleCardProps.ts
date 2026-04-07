export type CreateRoleCardProps = {
    createName: string;
    busy: boolean;
    onNameChange: (value: string) => void;
    onSubmit: (formData: FormData) => Promise<void>;
};