export interface ActivityEvent {
    id?: string;
    type?: string;
    message?: string;
    timestamp?: string;
    source?: string;
    [key: string]: unknown;
}