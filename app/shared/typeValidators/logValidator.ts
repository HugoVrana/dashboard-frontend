import {type LogCreate} from "@/app/shared/models/logCreate";

export function mapToLogCreate(
    level: string,
    message: string,
    service: string,
    environment: string,
    meta: Record<string, unknown> = {}
): LogCreate {
    return {
        timestamp: new Date().toISOString(),
        level,
        message,
        service,
        environment,
        ...meta,
    };
}
