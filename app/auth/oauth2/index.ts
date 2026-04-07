/**
 * OAuth2 connector module for the dashboard frontend.
 *
 * Implements the OAuth2 Authorization Code flow with PKCE (RFC 6749 + RFC 7636)
 * against the dashboard-spring-oauth V2 API endpoints.
 *
 * Endpoints used:
 *   GET  /v2/oauth2/authorize      - Initiate authorization request
 *   POST /v2/oauth2/authorize      - Submit user credentials
 *   POST /v2/oauth2/authorize/mfa  - Complete MFA step
 *   POST /v2/oauth2/token          - Exchange code for tokens / refresh tokens
 *   POST /v2/oauth2/revoke         - Revoke tokens (RFC 7009)
 *   GET  /v2/oauth2/userinfo        - Fetch user info (OIDC UserInfo endpoint)
 */
export {loginWithOAuth2, completeMfaLogin, refreshAccessToken, revokeToken, initiatePkce} from "./oauth2ServerClient";
export {generateCodeVerifier, generateCodeChallenge} from "./pkce";
