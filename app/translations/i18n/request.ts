import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const supportedLocales = ["en", "de"];

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieValue: string | undefined = cookieStore.get("locale")?.value;
    const fornicated : string | undefined = cookieValue?.replace("locale=", "").substring(0, 2);
    console.log(`Locale in cookie : ${cookieValue}`);
    console.log(`Turnicated locale : ${fornicated}`);

    // Validate locale - fall back to 'en' if invalid
    const locale : string = supportedLocales.includes(fornicated ?? "") ? fornicated! : "en";
    console.log(`Locale in request.ts : ${locale}`)

    return {
        locale,
        timeZone: "Europe/Zurich",
        messages: (await import(`../${locale}.json`)).default,
    };
});