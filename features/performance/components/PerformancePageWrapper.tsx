"use client";

import { useParams } from "next/navigation";
import type { Perspective } from "@/lib/utils/url-params";
import { useTheme } from "@/components/theme-provider";
import { useEffect } from "react";

interface PerformancePageWrapperProps {
  children: React.ReactNode;
  perspective?: string;
}

/**
 * Wrapper para sincronizar tema com perspectiva
 */
export function PerformancePageWrapper({
  children,
  perspective: propsPerspective,
}: PerformancePageWrapperProps) {
  const params = useParams();
  const { setTheme, currentTheme } = useTheme();
  
  const perspective = (propsPerspective || params.perspectiva) as Perspective;

  // Sync tema com perspectiva da URL
  useEffect(() => {
    if (currentTheme !== perspective) {
      setTheme(perspective);
    }
  }, [perspective, currentTheme, setTheme]);

  return <>{children}</>;
}

