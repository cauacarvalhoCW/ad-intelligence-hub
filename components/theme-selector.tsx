"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Check } from "lucide-react";

export function ThemeSelector() {
  const { currentTheme, setTheme, themes, isLoading } = useTheme();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Tema:</span>
      </div>

      <div className="flex items-center space-x-2">
        {Object.entries(themes).map(([key, theme]) => {
          const isActive = currentTheme === key;

          return (
            <Button
              key={key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(key)}
              className="relative flex items-center gap-2 transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: isActive
                  ? theme.colors.primary
                  : "transparent",
                borderColor: theme.colors.primary,
                color: isActive
                  ? theme.colors.background === "#000000"
                    ? "#ffffff"
                    : "#000000"
                  : theme.colors.primary,
              }}
            >
              {theme.logo && (
                <img
                  src={theme.logo}
                  alt={`${theme.name} logo`}
                  className="w-4 h-4 object-contain rounded-sm"
                />
              )}
              <span className="font-medium">{theme.name}</span>
              {isActive && <Check className="w-3 h-3 ml-1" />}
            </Button>
          );
        })}
      </div>

      {/* Theme preview indicator */}
      <div className="flex items-center space-x-1">
        {Object.entries(themes).map(([key, theme]) => (
          <div
            key={key}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-200 cursor-pointer hover:scale-110 ${
              currentTheme === key
                ? "border-foreground scale-110"
                : "border-muted-foreground/30"
            }`}
            style={{ backgroundColor: theme.colors.primary }}
            onClick={() => setTheme(key)}
            title={theme.name}
          />
        ))}
      </div>
    </div>
  );
}

export function ThemePreviewCard() {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{theme.name}</h3>
            {theme.logo && (
              <img
                src={theme.logo}
                alt={`${theme.name} logo`}
                className="w-8 h-8 object-contain rounded"
              />
            )}
          </div>

          {theme.metadata?.description && (
            <p className="text-sm text-muted-foreground">
              {theme.metadata.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
              }}
            >
              Primary
            </Badge>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: theme.colors.secondary,
                color: theme.colors.background,
              }}
            >
              Secondary
            </Badge>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.background,
              }}
            >
              Accent
            </Badge>
          </div>

          {theme.metadata?.industry && (
            <div className="pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Indústria: {theme.metadata.industry}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
