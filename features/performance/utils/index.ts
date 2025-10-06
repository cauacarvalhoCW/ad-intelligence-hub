export * from "./kpi-calculations";
export * from "./chart-data";
export { debugPerformanceData } from "./debug-data";

// Helper to get products by perspective
export function getProductsForPerspective(perspective: string): string[] {
  switch (perspective) {
    case "jim":
      return ["JIM"];
    case "infinitepay":
      return ["POS", "TAP", "LINK"];
    case "default":
    case "cloudwalk":
      return ["POS", "TAP", "LINK", "JIM"];
    default:
      return ["POS", "TAP", "LINK", "JIM"];
  }
}

