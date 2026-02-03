import { NextResponse } from 'next/server';
import { HttpStatusEnum } from '@/app/models/httpStatusEnum';
import { isEmailSendRequest, mapToEmailSendRequest } from '@/app/typeValidators/emailSendRequestValidator';
import { EmailSendRequest } from '@/app/models/mails/emailSendRequest';
import GrafanaServerClient from '@/app/lib/dataAccess/grafanaServerClient';

const grafanaClient = new GrafanaServerClient();

export interface ValidationResult {
    email?: EmailSendRequest;
    error?: NextResponse;
}

export function validateEmailRequest(
    body: any,
    expectedType: 'verify' | 'password_reset',
    routeName: string
): ValidationResult {
    // Type validation (structure)
    if (!body || !isEmailSendRequest(body)) {
        grafanaClient.error(`${routeName} : Request body is not valid ${JSON.stringify(body)}`);
        return {
            error: NextResponse.json(
                { status: HttpStatusEnum.BAD_REQUEST },
                { statusText: 'Invalid Body' }
            )
        };
    }

    const email : EmailSendRequest | null = mapToEmailSendRequest(body);
    if (!email) {
        grafanaClient.error(`${routeName} : Failed to map request body ${JSON.stringify(body)}`);
        return {
            error: NextResponse.json(
                { status: HttpStatusEnum.BAD_REQUEST },
                { statusText: 'Bad request : invalid format' }
            )
        };
    }

    // Business logic validation
    if (email.emailType !== expectedType) {
        grafanaClient.error(`${routeName} : Email type mismatch. Expected ${expectedType}, got ${email.emailType}`);
        return {
            error: NextResponse.json(
                { status: HttpStatusEnum.BAD_REQUEST },
                { statusText: `Payload is not a ${expectedType} email.` }
            )
        };
    }

    if (email.locale !== 'en' && email.locale !== 'de') {
        grafanaClient.error(`${routeName} : Invalid locale ${email.locale}`);
        return {
            error: NextResponse.json(
                { status: HttpStatusEnum.BAD_REQUEST },
                { statusText: 'Only de or en locale allowed.' }
            )
        };
    }

    return { email };
}