export interface RegisterFormProps {
    onComplete: () => void;
    onMfaRequired: () => void;
    onTwoFactorEnrollmentRequired: (credentials: { accessToken: string; url: string }) => void;
}
