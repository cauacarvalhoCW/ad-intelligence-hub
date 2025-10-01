import { redirect } from "next/navigation";
import { isValidPerspective } from "@/lib/utils/url-params";
import { PRODUCTS_BY_PERSPECTIVE, type ProductType } from "@/features/performance/types";
import { ProductPerformanceDashboard } from "@/features/performance/components/ProductPerformanceDashboard";

interface ProductPageProps {
  params: Promise<{ perspectiva: string; produto: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { perspectiva, produto } = await params;

  // Validar perspectiva
  if (!isValidPerspective(perspectiva)) {
    redirect("/default/performance");
  }

  // Validar produto
  const validProducts = PRODUCTS_BY_PERSPECTIVE[perspectiva] || [];
  const productUpper = produto.toUpperCase() as ProductType;
  
  if (!validProducts.includes(productUpper)) {
    // Produto inválido para esta perspectiva, redirecionar para overview
    redirect(`/${perspectiva}/performance`);
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <ProductPerformanceDashboard 
        perspective={perspectiva} 
        product={productUpper} 
      />
    </main>
  );
}
