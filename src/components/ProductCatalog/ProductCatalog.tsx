import styles from "./ProductCatalog.module.scss";
import InfiniteProductGrid from "@/components/InfiniteProductGrid/InfiniteProductGrid";
import ProductPanel from "@/components/ProductPanel/ProductPanel";
import type { ProductCategory } from "@/lib/products";
import type { ProductPage } from "@/types/product-catalog";
import { getAccessSession } from "@/lib/auth";

interface ProductCatalogProps {
    initialPage: ProductPage;
    category?: ProductCategory;
}

export default async function ProductCatalog(props: ProductCatalogProps) {
    const session = await getAccessSession();
    const productsUrl = props.category
        ? `/api/products?${new URLSearchParams({ category: props.category })}`
        : "/api/products";

    return (
        <div className={styles.mainPage}>
            <ProductPanel />
            <InfiniteProductGrid
                key={`${productsUrl}:${session?.userId ?? "guest"}`}
                initialPage={props.initialPage}
                productsUrl={productsUrl}
                isAuthenticated={Boolean(session)}
            />
        </div>
    );
}
