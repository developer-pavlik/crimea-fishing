import styles from './ProductCategoriesMenu.module.scss'
import Link from "next/link";
import { getMenuCategories } from "@/lib/categories";
import ProductCategoriesMenuToggle from "./ProductCategoriesMenuToggle";

const ProductCategoriesMenu = async () => {
    const items = await getMenuCategories();

    return (
        <ProductCategoriesMenuToggle>
            <ul className={styles.menuList}>
                {items.map((category) => (
                    <li key={category.id} className={styles.menuItem}>
                        <Link className={styles.menuLink} href={`/catalog/${category.slug}`}>
                            <div className={styles.iconWrapper}></div>
                            <div className={styles.description}>
                                <span className={styles.title}>{category.name}</span>
                                {category.description && (
                                    <span className={styles.subText}>{category.description}</span>
                                )}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </ProductCategoriesMenuToggle>
    )
}

export default ProductCategoriesMenu
