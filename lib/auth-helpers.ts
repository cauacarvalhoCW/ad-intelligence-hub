import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Domain guard configuration
const ALLOWED_DOMAIN = "@cloudwalk.io";

/**
 * Helper to verify if the user is authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return { userId };
}

/**
 * Helper to verify authentication AND domain
 */
export async function requireAuthWithDomainCheck() {
  const { userId } = await auth();
  if (!userId) {
    console.log(
      "🔒 requireAuthWithDomainCheck: No userId, redirecting to sign-in",
    );
    redirect("/sign-in");
  }

  // Domain verification
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";

  console.log("🔍 requireAuthWithDomainCheck Debug:");
  console.log("  👤 User ID:", userId);
  console.log("  📧 Email found:", email);
  console.log("  🎯 Required domain:", ALLOWED_DOMAIN);
  console.log("  ✅ Email ends with domain?", email.endsWith(ALLOWED_DOMAIN));

  if (!email.endsWith(ALLOWED_DOMAIN)) {
    console.log(
      `🚫 requireAuthWithDomainCheck: Domain check FAILED for email: "${email}"`,
    );
    console.log(`   Expected to end with: "${ALLOWED_DOMAIN}"`);
    redirect("/access-denied");
  }

  console.log(
    `✅ requireAuthWithDomainCheck: Domain check PASSED for email: "${email}"`,
  );
  return { userId, user };
}

/**
 * Helper to get authenticated user information
 */
export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  return { userId };
}

/**
 * Helper to get full user data
 */
export async function getUserData() {
  const user = await currentUser();
  return user;
}

/**
 * Helper to check user domain without redirect
 */
export async function checkUserDomain(): Promise<{
  isValid: boolean;
  email: string;
}> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const isValid = email.endsWith(ALLOWED_DOMAIN);

  return { isValid, email };
}

/**
 * Helper to verify specific roles/permissions
 */
export async function requireRole(requiredRole: string) {
  const { sessionClaims } = await auth();
  const userRole = (sessionClaims as any)?.metadata?.role;

  if (userRole !== requiredRole) {
    redirect("/unauthorized");
  }

  return { userRole };
}

/**
 * Helper para verificar roles (se implementado)
 */
export async function checkUserRole(requiredRole: string) {
  const user = await currentUser();
  // Supondo que o role esteja em publicMetadata
  const userRole = user?.publicMetadata?.role as string | undefined;
  return userRole === requiredRole;
}

/**
 * Types for TypeScript
 */
export type AuthUser = {
  userId: string;
};

export type UserWithRole = AuthUser & {
  role: string;
};
