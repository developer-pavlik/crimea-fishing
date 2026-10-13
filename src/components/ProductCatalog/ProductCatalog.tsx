import styles from "./ProductCatalog.module.scss";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import ProductPanel from "@/components/ProductPanel/ProductPanel";
import type { ProductTileProps } from "@/components/ProductTile/ProductTile";
import { getAccessSession } from "@/lib/auth";

export interface ProductCatalogProps {
    items: ProductTileProps[];
}

export default async function ProductCatalog({ items }: ProductCatalogProps) {
    const session = await getAccessSession();

    return (
        <div className={styles.mainPage}>
            <ProductPanel />
            <ProductGrid items={items} isAuthenticated={Boolean(session)} />
        </div>
    );
}
