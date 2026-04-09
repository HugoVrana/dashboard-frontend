export type LoadErrorProps = {
    loadError: string | null;
    loading: boolean;
    onRetry: () => void;
};