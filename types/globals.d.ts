export {};

declare global {
  interface CustomJwtSessionClaims {
    email?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    metadata?: {
      role?: string;
      onboardingComplete?: boolean;
      [key: string]: any;
    };
    emailVerified?: boolean;
    imageUrl?: string;
    createdAt?: string;
    lastSignIn?: string;
  }
}
