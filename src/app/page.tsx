import ProductCatalog from "@/components/ProductCatalog/ProductCatalog";
import { getAccessSession } from "@/lib/auth";
import { getProductPage } from "@/lib/products";

export default async function ProductsPage() {
    const session = await getAccessSession();
    const initialPage = await getProductPage(null, session?.userId);

    return <ProductCatalog initialPage={initialPage} />;
}
