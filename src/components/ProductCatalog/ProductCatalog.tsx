import styles from "./ProductCatalog.module.scss";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import { products } from "@/app/data";
import ProductPanel from "@/components/ProductPanel/ProductPanel";

export default function ProductCatalog() {
    return (
        <div className={styles.mainPage}>
            <ProductPanel />
            <ProductGrid items={products} />
        </div>
    );
}
