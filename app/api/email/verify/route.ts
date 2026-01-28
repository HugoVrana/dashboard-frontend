import {NextRequest, NextResponse} from "next/server";
import {Resend} from "resend";
import {EmailSendRequest} from "@/app/models/mails/emailSendRequest";
import {isEmailSendRequest, mapToEmailSendRequest} from "@/app/typeValidators/emailSendRequestValidator";
import {DASHBOARD_AUTH_API_CONFIG} from "@/app/lib/devOverlay/dashboardAuthApiContext";
import {HttpStatusEnum} from "@/app/models/httpStatusEnum";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

// this endpoint is called by the auth api - there was no better way to use resend
export async function POST(request : NextRequest) {
    try {
        if (!resend) {
            return NextResponse.json(
                { status : HttpStatusEnum.SERVICE_UNAVAILABLE },
                { statusText : 'Could not connect to email server' }
            );
        }
        const body = await request.json();
        if (!isEmailSendRequest(body)) {
            return NextResponse.json(
                { status : HttpStatusEnum.BAD_REQUEST },
                { statusText : 'Invalid Body' }
            );
        }
        const email : EmailSendRequest | null = mapToEmailSendRequest(body);

        if (!email) {
            return NextResponse.json(
                { status : HttpStatusEnum.BAD_REQUEST },
                { statusText : 'Bad request : invalid format' }
            );
        }
        const { data, error } = await resend.emails.send({
            from: 'acme@dashboard.run.place',
            to: email.recipientEmail,
            subject: 'Verify your email',
            html: `<p>Click <a href="${DASHBOARD_AUTH_API_CONFIG.CLOUD_URL}/api/auth/verify-email/?token=${email.tokenId}">here</a> to verify your email.</p>`,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
            );
        }

        return NextResponse.json({
            status: HttpStatusEnum.OK,
            messageId: data?.id
        });
    }
    catch (error) {
        console.error('Failed to verify email:', error);
        return NextResponse.json(
            { error : 'Internal server error' },
            { status : HttpStatusEnum.INTERNAL_SERVER_ERROR }
        )
    }
}