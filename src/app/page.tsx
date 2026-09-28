import styles from "./page.module.scss";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import { products } from './data';
import ProductPanel from "@/components/ProductPanel/ProductPanel";

export default function ProductPage() {
    return (
        <div className={styles.mainPage}>
            <ProductPanel />
            <ProductGrid items={products} />
        </div>
    );
}


