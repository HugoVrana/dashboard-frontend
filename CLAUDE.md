# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

This is a Next.js 16 dashboard frontend application using the App Router with NextAuth for authentication. It connects to a Spring Boot backend API (local at `localhost:8080` or cloud at `spring-dashboard-1.onrender.com`).

### Key Architectural Patterns

**Dual API Client Pattern**: The codebase separates client-side and server-side data access:
- `app/lib/dataAccess/*Client.ts` - Client-side fetching with `"use client"` directive
- `app/lib/dataAccess/*ServerClient.ts` - Server-side fetching for server components

**Runtime Type Validation**: All API responses are validated through type validators in `app/typeValidators/`. Each validator has:
- `is<Type>(x)` - Type guard function
- `mapTo<Type>(x)` - Mapper function that returns validated object or null

**Dev Overlay System**: Development-only overlay (`app/ui/devOverlay/`) for switching between local and cloud API endpoints. State is managed through `ApiContext` and persisted via cookies.

**Authentication Flow**: NextAuth with JWT strategy (`auth.ts`). Custom credentials provider that authenticates against the backend API. Session includes access/refresh tokens and user roles/grants.

### Path Aliases

Use `@/*` for imports from root (configured in `tsconfig.json`).

### Project Structure

```
app/
├── api/                    # Next.js API routes
│   ├── auth/[...nextauth]/ # NextAuth handler
│   └── loki/              # Logging proxy to Grafana Loki
├── lib/
│   ├── dataAccess/        # API client modules (dual client/server pattern)
│   ├── devOverlay/        # Dev overlay context and configuration
│   └── permission/        # Auth token retrieval utilities
├── models/                # TypeScript interfaces for domain objects
├── typeValidators/        # Runtime type guards and mappers
└── ui/
    ├── base/              # Base UI components (button, input, card, etc.)
    └── devOverlay/        # Development overlay components
```

### Backend API Configuration

The dashboard API URLs are configured in `app/lib/devOverlay/dashboardApiContext.ts`:
- Local: `http://localhost:8080`
- Cloud: `https://spring-dashboard-1.onrender.com`

Auth API URLs are in `app/lib/devOverlay/dashboardAuthApiContext.ts`.

### Logging

`GrafanaClient` and `GrafanaServerClient` classes send logs to Grafana Loki via the `/api/loki` proxy endpoint.
