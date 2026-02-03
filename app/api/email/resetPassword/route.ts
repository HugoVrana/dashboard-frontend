import {NextRequest, NextResponse} from "next/server";
import {HttpStatusEnum} from "@/app/models/httpStatusEnum";
import {Resend} from "resend";
import GrafanaServerClient from "@/app/lib/dataAccess/grafanaServerClient";
import {isEmailSendRequest, mapToEmailSendRequest} from "@/app/typeValidators/emailSendRequestValidator";
import {EmailSendRequest} from "@/app/models/mails/emailSendRequest";
import {ReadonlyHeaders} from "next/dist/server/web/spec-extension/adapters/headers";
import {headers} from "next/headers";
import PasswordResetEmail from "@/app/ui/emailTemplates/passwordResetEmail";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
const grafanaClient = new GrafanaServerClient();

// this endpoint is called by the auth api - there was no better way to use resend
export async function POST(request : NextRequest) {
    try {
        if (!resend) {
            grafanaClient.error("api/email/resetPassword : Resend email server not accessible`);");
            return NextResponse.json(
                { status: HttpStatusEnum.SERVICE_UNAVAILABLE },
                { statusText : "Could not connect to email server" }
            );
        }

        const body = await request.body;
        if (!body || !isEmailSendRequest(body)) {
            grafanaClient.error(`api/email/resetPassword : Request body is not valid ${body}`);
            return NextResponse.json(
                { status : HttpStatusEnum.BAD_REQUEST },
                { statusText : 'Invalid Body' }
            );
        }

        const email : EmailSendRequest | null = mapToEmailSendRequest(body);
        if (!email) {
            grafanaClient.error(`api/email/resetPassword : Request body is not valid ${body}`);
            return NextResponse.json(
                { status : HttpStatusEnum.BAD_REQUEST },
                { statusText : 'Bad request : invalid format' }
            );
        }

        if (email.emailType !== "password_reset") {
            grafanaClient.error(`api/email/resetPassword : Request body is not valid ${body.emailType}`);
            return NextResponse.json(
                { status : HttpStatusEnum.BAD_REQUEST },
                { statusText : 'Payload is not a verification email.' }
            );
        }

        if (email.locale !== "en" && email.locale !== "de") {
            grafanaClient.error(`api/email/resetPassword : Locale for email was not valid ${email.locale}`);
            return NextResponse.json(
                { status : HttpStatusEnum.BAD_REQUEST },
                { statusText : 'Only de or en locale allowed.' }
            )
        }

        const headersList : ReadonlyHeaders = await headers();
        const host : string = headersList.get('host') ?? 'nextjs-dashboard';

        const resetPasswordEmail = PasswordResetEmail({
            locale : email.locale,
            token : email.tokenId,
            url : host
        });

        const { data, error } = await resend.emails.send({
            from : 'acme@dashboard.run.place',
            to : email.recipientEmail,
            subject : 'Reset your password',
            react : resetPasswordEmail
        });

        if (error) {
            grafanaClient.error(`api/email/resetPassword : Error occurred : ${error}`);
            console.error('Resend error:', error);
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
            );
        }

        if (!data?.id) {
            grafanaClient.error(`api/email/resetPassword : Resend didn't provide email id`);
            console.error("Resend didn't provide email id");
            return NextResponse.json(
                { error: 'Failed to send email id' },
                { status : HttpStatusEnum.INTERNAL_SERVER_ERROR }
            )
        }

        return NextResponse.json({
            status: HttpStatusEnum.OK,
            messageId: data?.id
        });
    }
    catch (error) {
        grafanaClient.error(`api/email/resetPassword : Failed to send email id ${error}`);
        console.error('Failed to send password reset email:', error);
        return NextResponse.json(
            { error : 'Internal server error' },
            { status : HttpStatusEnum.INTERNAL_SERVER_ERROR }
        )
    }
}