import { LogCreate } from "../models/log/logCreate";

export function mapToLogCreate(level: string, message: string, service : string, environment : string, meta: any = {}) : LogCreate {
    const timestamp : string = new Date().toISOString();
    return {
        timestamp,
        level,
        message,
        service,
        environment,
        ...meta,
    };
}