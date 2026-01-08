export type LogCreate = {
    timestamp: string;
    level: string;
    message: string;
    service: string;
    environment: string;
    route?: string;
    error?: object;
    [key: string]: unknown;
}