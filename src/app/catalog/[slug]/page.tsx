import { notFound } from "next/navigation";
import { getAccessSession } from "@/lib/auth";
import { getInitialCatalogProductPage, parseCatalogSort } from "@/lib/catalog";
import { getCategoryBySlug } from "@/lib/categories";
import { parseSearchFilters } from "@/lib/search-filters";
import Catalog from "@/components/Catalog/Catalog";
import ProductCatalogError from "@/components/ProductCatalogError/ProductCatalogError";

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const sort = parseCatalogSort(query.sort);
  const filters = parseSearchFilters((key) => query[key]);
  const session = await getAccessSession();
  const result = await getInitialCatalogProductPage({
    categoryId: category.id,
    sort,
    filters,
    viewerId: session?.userId,
  });

  if (!result.ok) {
    return <ProductCatalogError />;
  }

  return (
    <Catalog
      category={{ name: category.name, slug }}
      initialPage={result.page}
      sort={sort}
      filters={filters}
      isAuthenticated={!!session}
    />
  );
}
