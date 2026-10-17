import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm/ProductForm";
import { updateProduct } from "@/actions/products";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getAccessSession } from "@/lib/auth";
import { isProductId } from "@/lib/products";
import type { ProductSpecificationRow } from "@/types/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Редактирование товара | Рыбацкая барахолка",
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  if (!isProductId(id)) notFound();

  const session = await getAccessSession();
  if (!session) notFound();

  const [product] = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      condition: products.condition,
      imagesUrl: products.imagesUrl,
      description: products.description,
      specifications: products.specifications,
    })
    .from(products)
    .where(and(eq(products.id, id), eq(products.seller, session.userId)))
    .limit(1);

  if (!product) notFound();

  const specifications: ProductSpecificationRow[] = Object.entries(
    product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)
      ? product.specifications
      : {},
  ).map(([name, value]) => ({ name, value: String(value) }));

  async function handleSubmit(data: Parameters<typeof updateProduct>[1]) {
    "use server";
    const result = await updateProduct(id, data);
    if (result.success) redirect(`/product/${result.id}`);
    throw new Error(result.error === "unauthorized" ? "Требуется авторизация" : "Не удалось сохранить товар");
  }

  return (
    <ProductForm
      initialData={{
        id: product.id,
        title: product.title,
        price: product.price,
        isFree: product.price === 0,
        condition: product.condition,
        imagesUrl: product.imagesUrl,
        description: product.description ?? "",
        specifications,
      }}
      onSubmit={handleSubmit}
    />
  );
}
