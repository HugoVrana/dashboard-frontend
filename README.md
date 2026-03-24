This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Design
Component library : [Base UI](https://base-ui.com/react/components)

New components can be added with 
```bash
npx shadcn@latest add <component-name>
```

Icons : [Lucide](https://lucide.dev/icons)

## API Code Generation

TypeScript types and client code for the backend API are generated from the OpenAPI spec using [orval](https://orval.dev).

### Generated files

| Script | Spec source | Output |
|---|---|---|
| `npm run generate:oauth-api` | `https://dashboard-spring-oauth.onrender.com/v3/api-docs/v2` | `app/lib/api/oauth-v2.ts` |
| `npm run generate:data-api` | `https://dashboard-spring-data.onrender.com/v3/api-docs` | `app/lib/api/data-api.ts` |
| `npm run generate:api` | both | both |

Do not edit generated files manually.

### Regenerating after spec changes

```bash
npm run generate:api      # regenerate both
npm run generate:oauth-api  # regenerate OAuth spec only
npm run generate:data-api   # regenerate data API spec only
```

Each script downloads the latest spec, patches it for orval compatibility (see `fix-spec.mjs`), and regenerates the TypeScript output.

### Why manual URL building?

The generated functions have a hardcoded base URL (`OAUTH2_SERVER_URL` env var). The OAuth2 client (`app/auth/oauth2/oauth2ServerClient.ts`) uses a dynamic `serverUrl` at runtime (stored in the JWT, set by the dev overlay). For this reason, the server client imports **types** from the generated file but builds URLs dynamically rather than calling the generated functions directly.