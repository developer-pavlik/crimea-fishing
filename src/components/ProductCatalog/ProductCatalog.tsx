import styles from "./ProductCatalog.module.scss";
import InfiniteProductGrid from "@/components/ProductGrid/InfiniteProductGrid";
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

    return (
        <div className={styles.mainPage}>
            <ProductPanel />
            <InfiniteProductGrid
                initialPage={props.initialPage}
                category={props.category}
                isAuthenticated={Boolean(session)}
            />
        </div>
    );
}
