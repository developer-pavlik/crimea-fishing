import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductCatalog from "@/components/ProductCatalog/ProductCatalog";
import ProductCatalogError from "@/components/ProductCatalogError/ProductCatalogError";
import { getAccessSession } from "@/lib/auth";
import {
  getInitialProductPage,
  isProductCategory,
  type ProductCategory,
} from "@/lib/products";

interface Props {
  params: Promise<{ type: string }>; // В Next.js 15+ params — это Promise
}

const CATEGORY_TITLES: Record<ProductCategory, string> = {
  free: 'Бесплатные снасти',
  new: 'Новые снасти',
  used: 'Снасти б/у',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;

  if (!isProductCategory(type)) {
    notFound();
  }

  return {
    title: `${CATEGORY_TITLES[type]}`,
  };
}

export default async function ProductTypePage({ params }: Props) {
  const { type } = await params;

  if (!isProductCategory(type)) {
    notFound();
  }

  const session = await getAccessSession();
  const result = await getInitialProductPage(session?.userId, type);

  if (!result.ok) {
    return <ProductCatalogError />;
  }

  return (
    <ProductCatalog initialPage={result.page} category={type} />
  );
}