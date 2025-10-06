"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type { Product, Perspective } from "../types";
import { getProductsForPerspective } from "../utils";

interface ProductTabsProps {
  perspective: Perspective;
  activeProduct?: Product; // Optional: if provided, highlights this tab
}

export function ProductTabs({ perspective, activeProduct }: ProductTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const products = getProductsForPerspective(perspective);

  // Always navigate to drilldown
  const handleTabChange = (value: string) => {
    const product = value as Product;
    router.push(`/${perspective}/performance/${product.toLowerCase()}`);
  };

  // Get active tab from URL or prop
  const getActiveTab = (): string | undefined => {
    // If activeProduct is provided, use it (drilldown mode)
    if (activeProduct) return activeProduct;

    // Try to extract from URL
    const match = pathname?.match(/\/performance\/([^\/]+)/);
    if (match) {
      const urlProduct = match[1].toUpperCase();
      if (products.includes(urlProduct as Product)) {
        return urlProduct;
      }
    }

    // Return undefined for overview (no selection)
    return undefined;
  };

  const isOverviewPage = pathname?.endsWith("/performance");
  const activeTab = getActiveTab();

  return (
    <div className="flex justify-center">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className={isOverviewPage ? "h-14 p-1.5" : "h-12 p-1"}>
          {products.map((product) => (
            <TabsTrigger
              key={product}
              value={product}
              className={
                isOverviewPage
                  ? "text-lg px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  : "px-6 py-2"
              }
            >
              {product}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
