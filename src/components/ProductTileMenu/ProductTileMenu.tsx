import styles from './ProductTileMenu.module.scss'
import {MenuProvider, MenuButton, Menu, MenuItem} from "@ariakit/react";
import MenuIcon from '../../../public/icons/ellipsis.svg';

const ProductTileMenu = () => {
    return (
        <MenuProvider>
            <MenuButton className={styles.menuButton}>
                <MenuIcon className={styles.menuIcon} />
            </MenuButton>
            <Menu gutter={8} className={styles.menu}>
                <MenuItem className={styles.menuItem}>Option 1</MenuItem>
                <MenuItem className={styles.menuItem}>Option 2</MenuItem>
                <MenuItem className={styles.menuItem}>Option 3</MenuItem>
            </Menu>
        </MenuProvider>
    );
};

export default ProductTileMenu