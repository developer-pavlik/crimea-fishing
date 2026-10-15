import styles from "./ProductCatalog.module.scss";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import InfiniteProductGrid from "@/components/ProductGrid/InfiniteProductGrid";
import ProductPanel from "@/components/ProductPanel/ProductPanel";
import type { ProductTileProps } from "@/components/ProductTile/ProductTile";
import type { ProductPage } from "@/types/product-catalog";
import { getAccessSession } from "@/lib/auth";

type ProductCatalogProps =
    | { initialPage: ProductPage; items?: never }
    | { items: ProductTileProps[]; initialPage?: never };

export default async function ProductCatalog(props: ProductCatalogProps) {
    const session = await getAccessSession();

    return (
        <div className={styles.mainPage}>
            <ProductPanel />
            {props.initialPage ? (
                <InfiniteProductGrid
                    initialPage={props.initialPage}
                    isAuthenticated={Boolean(session)}
                />
            ) : (
                <ProductGrid
                    items={props.items}
                    isAuthenticated={Boolean(session)}
                />
            )}
        </div>
    );
}
