export interface LoginFormProps {
    onSuccess: () => void;
    onMfaRequired: () => void;
    requestId?: string;
}