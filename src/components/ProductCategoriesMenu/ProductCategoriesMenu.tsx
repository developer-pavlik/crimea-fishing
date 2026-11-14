import styles from './ProductCategoriesMenu.module.scss'
import { Button } from "@/components/ui/Button/Button";
import MenuIcon from '../../../public/icons/category.svg';

const ProductCategoriesMenu = () => {
    return (
        <div className={styles.productCategoriesMenu}>
            <Button className={styles.button} type="button" view="primary">
                <span>Каталог</span>
                <MenuIcon className={styles.menuIcon} />
            </Button>

            <div className={styles.dropdown}>
                <div className={styles.backdrop} />

                <div className={styles.menu}>
                    <ul className={styles.menuList}>
                        <li className={styles.menuItem}>
                            <a className={styles.menuLink} href="#">Категория 1</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ProductCategoriesMenu