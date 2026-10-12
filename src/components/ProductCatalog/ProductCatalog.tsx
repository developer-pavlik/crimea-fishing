import styles from "./ProductCatalog.module.scss";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import ProductPanel from "@/components/ProductPanel/ProductPanel";
import type { ProductTileProps } from "@/components/ProductTile/ProductTile";

export interface ProductCatalogProps {
    items: ProductTileProps[];
}

export default function ProductCatalog({ items }: ProductCatalogProps) {
    return (
        <div className={styles.mainPage}>
            <ProductPanel />
            <ProductGrid items={items} />
        </div>
    );
}
