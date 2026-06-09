import { Suspense } from "react";
import { isKeycloakEnabled } from "@/lib/keycloak-config";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const keycloakEnabled = isKeycloakEnabled();

  return (
    <Suspense fallback={null}>
      <LoginForm keycloakEnabled={keycloakEnabled} />
    </Suspense>
  );
}
