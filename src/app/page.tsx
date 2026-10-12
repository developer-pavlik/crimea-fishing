import ProductCatalog from "@/components/ProductCatalog/ProductCatalog";
import { products } from "@/app/data";

export default function ProductsPage() {
    return <ProductCatalog items={products} />;
}

