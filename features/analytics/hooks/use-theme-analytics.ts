"use client";

import { useState, useEffect } from "react";
import type { ThemeAnalytics, ThemeType } from "@/features/analytics/types";

export function useThemeAnalytics() {
  const [analytics, setAnalytics] = useState<ThemeAnalytics>({
    themeUsage: {
      default: 0,
      cloudwalk: 0,
      infinitepay: 0,
      jim: 0,
    },
    mostPopularTheme: "default",
    themeChangeFrequency: 0,
    lastThemeChange: new Date().toISOString(),
  });

  useEffect(() => {
    // Load analytics from localStorage
    const savedAnalytics = localStorage.getItem(
      "edge-intelligence-theme-analytics",
    );
    if (savedAnalytics) {
      try {
        setAnalytics(JSON.parse(savedAnalytics));
      } catch (error) {
        console.error("Failed to parse theme analytics:", error);
      }
    }
  }, []);

  const trackThemeChange = (theme: ThemeType) => {
    setAnalytics((prev) => {
      const newAnalytics: ThemeAnalytics = {
        ...prev,
        themeUsage: {
          ...prev.themeUsage,
          [theme]: prev.themeUsage[theme] + 1,
        },
        themeChangeFrequency: prev.themeChangeFrequency + 1,
        lastThemeChange: new Date().toISOString(),
        mostPopularTheme: Object.entries({
          ...prev.themeUsage,
          [theme]: prev.themeUsage[theme] + 1,
        }).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as ThemeType,
      };

      // Save to localStorage
      localStorage.setItem(
        "edge-intelligence-theme-analytics",
        JSON.stringify(newAnalytics),
      );
      return newAnalytics;
    });
  };

  const resetAnalytics = () => {
    const resetData: ThemeAnalytics = {
      themeUsage: {
        default: 0,
        cloudwalk: 0,
        infinitepay: 0,
        jim: 0,
      },
      mostPopularTheme: "default",
      themeChangeFrequency: 0,
      lastThemeChange: new Date().toISOString(),
    };
    setAnalytics(resetData);
    localStorage.setItem(
      "edge-intelligence-theme-analytics",
      JSON.stringify(resetData),
    );
  };

  return {
    analytics,
    trackThemeChange,
    resetAnalytics,
  };
}
