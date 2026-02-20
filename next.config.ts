import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNexIntl = createNextIntlPlugin("./app/api/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNexIntl(nextConfig);
