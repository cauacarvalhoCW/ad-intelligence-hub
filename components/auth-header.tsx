"use client";

import { ThemeToggle } from "./theme-toggle";

export function AuthHeader() {
  return (
    <header className="absolute top-4 right-4 z-10">
      <div className="flex items-center gap-4">
        {/* Only Theme Toggle for authentication pages */}
        <ThemeToggle />
      </div>
    </header>
  );
}
