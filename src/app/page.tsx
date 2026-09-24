import styles from "./page.module.scss";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import { products } from './data';

export default function Home() {
    return (
        <div className={styles.page}>
            <ProductGrid items={products} />
        </div>
    );
}


