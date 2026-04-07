export type  CreateGrantCardProps = {
    name: string;
    description: string;
    busy: boolean;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSubmit: (formData: FormData) => Promise<void>;
};