import {EmailSendRequest} from "@/app/models/mails/emailSendRequest";

export function mapToEmailSendRequest(x : unknown) : EmailSendRequest | null {
    if (!isEmailSendRequest(x)){
      return null;
    }
    return {
        emailType : x.emailType,
        tokenId : x.tokenId,
        recipientEmail : x.recipientEmail,
        locale : x.locale,
    }
}

export function isEmailSendRequest(x: unknown) : x is EmailSendRequest {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.emailType === "string" &&
    typeof o.tokenId === "string" &&
    typeof o.recipientEmail === "string" &&
    typeof o.locale === "string"
  );
}