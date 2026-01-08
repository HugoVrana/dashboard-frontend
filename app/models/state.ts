export type State = {
    errors?: {
        customer?: string[];
        amount?: string[];
        status?: string[];
    };
    message: string | null;
};