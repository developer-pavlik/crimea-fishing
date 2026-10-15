import ProductCatalog from "@/components/ProductCatalog/ProductCatalog";
import ProductCatalogError from "@/components/ProductCatalogError/ProductCatalogError";
import { getAccessSession } from "@/lib/auth";
import { getInitialProductPage } from "@/lib/products";

export default async function ProductsPage() {
    const session = await getAccessSession();
    const result = await getInitialProductPage(session?.userId);

    if (!result.ok) {
        return <ProductCatalogError />;
    }

    return <ProductCatalog initialPage={result.page} />;
}
