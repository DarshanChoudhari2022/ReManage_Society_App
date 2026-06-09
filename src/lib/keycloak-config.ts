import "server-only";

function keycloakBaseUrl(): string {
  return (process.env.KEYCLOAK_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
}

export function isKeycloakEnabled(): boolean {
  if (process.env.KEYCLOAK_ENABLED === "false") {
    return false;
  }

  if (process.env.KEYCLOAK_ENABLED === "true") {
    return Boolean(process.env.KEYCLOAK_CLIENT_SECRET?.trim());
  }

  const base = keycloakBaseUrl();
  const hasSecret = Boolean(process.env.KEYCLOAK_CLIENT_SECRET?.trim());

  if (!hasSecret) {
    return false;
  }

  if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/.test(base)) {
    return false;
  }

  return true;
}

export function getKeycloakUnavailableMessage(): string {
  if (process.env.NODE_ENV === "production") {
    return "Keycloak sign-in is not configured for this deployment. Use email and password.";
  }

  return "Keycloak is not running locally. Start it with: docker compose up keycloak postgres -d";
}
