import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/categories";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return <h1>{category.name}</h1>;
}
