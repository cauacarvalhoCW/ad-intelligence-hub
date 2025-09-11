"use client";

/**
 * React Query Provider component
 * Provides global query caching and state management
 */

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

// Configure React Query with optimized caching and retry strategies
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
      retry: (failureCount, error: any) => {
        // Skip retry for auth errors (401/403) as they're permanent
        if (
          error?.message?.includes("401") ||
          error?.message?.includes("403")
        ) {
          return false;
        }
        // Retry up to 3 times for other errors with exponential backoff
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Mutations should not be retried by default
    },
  },
});

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
