export  interface SubmitAuthorizeResult {
    mfaRequired: boolean;
    mfaToken?: string;
    code?: string;
}