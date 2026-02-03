import { NextRequest, NextResponse } from 'next/server';
import { HttpStatusEnum } from '@/app/models/httpStatusEnum';
import PasswordResetEmail from '@/app/ui/emailTemplates/passwordResetEmail';
import {validateEmailRequest, ValidationResult} from '@/app/lib/email/validateEmailRequest';
import { sendEmail } from '@/app/lib/email/sendEmail';
import GrafanaServerClient from '@/app/lib/dataAccess/grafanaServerClient';
import { headers } from 'next/headers';
import {EmailSendRequest} from "@/app/models/mails/emailSendRequest";
import {ReadonlyHeaders} from "next/dist/server/web/spec-extension/adapters/headers";

const grafanaClient = new GrafanaServerClient();
const ROUTE_NAME = 'api/email/resetPassword';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation : ValidationResult = validateEmailRequest(body, 'password_reset', ROUTE_NAME);

        if (validation.error) {
            return validation.error;
        }

        const email : EmailSendRequest = validation.email!;
        const headersList : ReadonlyHeaders = await headers();
        const host : string = headersList.get('host') ?? 'nextjs-dashboard';

        const emailTemplate = PasswordResetEmail({
            locale: email.locale,
            token: email.tokenId,
            url: host
        });

        return await sendEmail({
            email,
            emailTemplate,
            subject: 'Reset your password',
            routeName: ROUTE_NAME
        });
    } catch (error) {
        grafanaClient.error(`${ROUTE_NAME} : Failed to send email ${error}`);
        console.error('Failed to send password reset email:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
        );
    }
}