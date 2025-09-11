"use client";

import React from "react";
import { SignedIn } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ChatWidget } from "./ChatWidget";

/**
 * Gate component to control when the chat widget is rendered.
 * - Only shows for authenticated users
 * - Hides on disallowed routes (e.g., Access Denied, auth pages)
 */
export function ChatWidgetGate() {
  const pathname = usePathname();

  // Pages where the widget should never appear
  const blockedPaths = [
    "/access-denied",
    "/sign-in",
    "/sign-up",
  ];

  const isBlocked = blockedPaths.some((p) => pathname?.startsWith(p));
  if (isBlocked) return null;

  return (
    <SignedIn>
      <ChatWidget />
    </SignedIn>
  );
}

export default ChatWidgetGate;

