import {
    Html,
    Head,
    Body,
    Container,
    Text,
    Button,
    Preview,
} from '@react-email/components';
import {PasswordResetEmailProps} from "@/app/models/mails/passwordResetEmailProps";

const content = {
    'en': {
        preview: 'Reset your password',
        heading: 'Reset your password',
        body: 'Click the button below to reset your password.',
        button: 'Reset Password',
    },
    'de': {
        preview: 'Setzen Sie Ihr Passwort zurück',
        heading: 'Passwort zurücksetzen',
        body: 'Klicken Sie auf die Schaltfläche unten, um Ihr Passwort zurückzusetzen.',
        button: 'Passwort zurücksetzen',
    },
};

export const PasswordResetEmail = (props: PasswordResetEmailProps) => {
    const t = content[props.locale as keyof typeof content] ?? content['en'];

    const protocol: string = (props.url.includes("localhost") ? 'http' : 'https');
    const resetUrl = `${protocol}://${props.url}/api/auth/reset-password?token=${props.token}`;

    return (
        <Html>
            <Head />
            <Preview>{t.preview}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={heading}>{t.heading}</Text>
                    <Text style={body}>{t.body}</Text>
                    <Button style={button} href={resetUrl}>
                        {t.button}
                    </Button>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px',
    borderRadius: '8px',
};

const heading = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
};

const body = {
    fontSize: '16px',
    color: '#4a4a4a',
};

const button = {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
};

export default PasswordResetEmail;
