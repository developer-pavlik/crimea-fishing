import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductCatalog from "@/components/ProductCatalog/ProductCatalog";
import { products } from "@/app/data";

interface Props {
  params: Promise<{ type: string }>; // В Next.js 15+ params — это Promise
}

const CATEGORY_TITLES = {
  free: 'Бесплатные снасти',
  new: 'Новые снасти',
  used: 'Снасти б/у',
} as const;

type ProductType = keyof typeof CATEGORY_TITLES;

function isProductType(type: string): type is ProductType {
  return type in CATEGORY_TITLES;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;

  if (!isProductType(type)) {
    notFound();
  }

  return {
    title: `${CATEGORY_TITLES[type]}`,
  };
}

export default async function ProductTypePage({ params }: Props) {
  const { type } = await params;

  if (!isProductType(type)) {
    notFound();
  }

  return (
    <ProductCatalog items={products} />
  );
}