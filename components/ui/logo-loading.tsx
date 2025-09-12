"use client";

import { cn } from "@/lib/utils";

interface LogoLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LogoLoading({ 
  className, 
  size = "md", 
  text = "Carregando..." 
}: LogoLoadingProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      {/* Logo animado pulando */}
      <div className="relative">
        <img
          src="/logos/logo.png"
          alt="EspiADinha"
          className={cn(
            sizeClasses[size],
            "animate-bounce drop-shadow-lg"
          )}
        />
        {/* Efeito de brilho */}
        <div className={cn(
          sizeClasses[size],
          "absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-pulse"
        )} />
      </div>
      
      {/* Texto de loading */}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
      
      {/* Pontos animados */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

// Componente inline para substituir spinners simples
export function LogoSpinner({ 
  className,
  size = "sm" 
}: { 
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-8 w-8"
  };

  return (
    <img
      src="/logos/logo.png"
      alt="Loading"
      className={cn(
        sizeClasses[size],
        "animate-bounce",
        className
      )}
    />
  );
}
