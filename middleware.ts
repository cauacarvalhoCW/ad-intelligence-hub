import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define routes publics (sign-in, sign-up, and access-denied)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/access-denied",
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes - redirect to sign-in if not authenticated
  const { userId } = await auth();

  if (!userId) {
    console.log(
      "🔒 Middleware: User not authenticated, redirecting to sign-in",
    );
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  console.log("✅ Middleware: User authenticated, proceeding to route");
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
