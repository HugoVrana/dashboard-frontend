import {
    Html,
    Head,
    Body,
    Container,
    Text,
    Button,
    Preview,
} from '@react-email/components';
import {VerificationEmailProps} from "@/app/models/mails/verificationEmailProps";

const content = {
    'en' : {
        preview: 'Verify your email address',
        heading: 'Verify your email',
        body: 'Click the button below to verify your email address.',
        button: 'Verify Email',
    },
    'de': {
        preview: 'Bestätigen Sie Ihre E-Mail-Adresse',
        heading: 'E-Mail bestätigen',
        body: 'Klicken Sie auf die Schaltfläche unten, um Ihre E-Mail-Adresse zu bestätigen.',
        button: 'E-Mail bestätigen',
    },
};

export const VerificationEmail = (props: VerificationEmailProps) => {
    const t = content[props.locale as keyof typeof content] ?? content['en'];

    const protocol : string = (props.url.includes("localhost") ? 'http' : 'https');
    const verificationUrl = `${protocol}://${props.url}/api/auth/verify?token=${props.token}`;
    console.log(verificationUrl);
    return (
        <Html>
            <Head />
            <Preview>{t.preview}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={heading}>{t.heading}</Text>
                    <Text style={body}>{t.body}</Text>
                    <Button style={button} href={verificationUrl}>
                        {t.button}
                    </Button>
                    <Text style={body}>{props.locale}</Text>
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

export default VerificationEmail; // this is here so react email can see it