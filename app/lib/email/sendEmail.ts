import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { HttpStatusEnum } from '@/app/models/httpStatusEnum';
import GrafanaServerClient from '@/app/lib/dataAccess/grafanaServerClient';
import { EmailSendRequest } from '@/app/models/mails/emailSendRequest';
import { ReactElement } from 'react';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
const grafanaClient = new GrafanaServerClient();

interface SendEmailParams {
    email: EmailSendRequest;
    emailTemplate: ReactElement;
    subject: string;
    routeName: string; // for logging context
}

export async function sendEmail({
                                    email,
                                    emailTemplate,
                                    subject,
                                    routeName
                                }: SendEmailParams) {
    if (!resend) {
        grafanaClient.error(`${routeName} : Resend email server not accessible`);
        return NextResponse.json(
            { status: HttpStatusEnum.SERVICE_UNAVAILABLE },
            { statusText: "Could not connect to email server" }
        );
    }
    const { data, error } = await resend.emails.send({
        from: 'acme@dashboard.run.place',
        to: email.recipientEmail,
        subject,
        react: emailTemplate,
    });

    if (error) {
        grafanaClient.error(`${routeName} : Error occurred : ${error}`);
        console.error('Resend error:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
        );
    }

    if (!data?.id) {
        grafanaClient.error(`${routeName} : Resend didn't provide email id`);
        console.error("Resend didn't provide email id");
        return NextResponse.json(
            { error: 'Failed to send email id' },
            { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
        );
    }

    return NextResponse.json({
        status: HttpStatusEnum.OK,
        messageId: data.id
    });
}