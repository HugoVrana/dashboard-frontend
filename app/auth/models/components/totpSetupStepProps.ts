export interface TotpSetupStepProps {
    onComplete: () => void;
    onSkip: () => void;
    required?: boolean;
    accessToken?: string;
    url?: string;
}
