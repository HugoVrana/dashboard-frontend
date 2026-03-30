import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNexIntl = createNextIntlPlugin("./app/shared/api/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    OAUTH2_CLIENT_ID: process.env.OAUTH2_CLIENT_ID,
    OAUTH2_CLIENT_SECRET: process.env.OAUTH2_CLIENT_SECRET,
  },
};

export default withNexIntl(nextConfig);
