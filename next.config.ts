import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNexIntl = createNextIntlPlugin("./app/shared/api/i18n/request.ts");

const serverActionAllowedOrigins = [
  "localhost:3000",
  "127.0.0.1:3000",
  "localhost:3001",
  "127.0.0.1:3001",
  process.env.NEXTAUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
]
  .filter((value): value is string => Boolean(value))
  .map((value) => {
    try {
      return new URL(value).host;
    } catch {
      return value;
    }
  });

const nextConfig: NextConfig = {
  env: {
    OAUTH2_CLIENT_ID: process.env.OAUTH2_CLIENT_ID,
    OAUTH2_CLIENT_SECRET: process.env.OAUTH2_CLIENT_SECRET,
  },
  experimental: {
    serverActions: {
      allowedOrigins: Array.from(new Set(serverActionAllowedOrigins)),
    },
  },
};

export default withNexIntl(nextConfig);
