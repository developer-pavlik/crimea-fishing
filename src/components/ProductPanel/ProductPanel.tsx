import PlusIcon from '../../../public/icons/plus.svg';
import Link from 'next/link';
import { getAccessSession } from '@/lib/auth';
import ProductPanelNavigation from '../ProductPanelNavigation/ProductPanelNavigation';
import styles from './ProductPanel.module.scss';

const ProductPanel = async () => {
    const session = await getAccessSession();

    return (
        <div className={styles.panelWrapper}>
            <div className={styles.panel}>
                <ProductPanelNavigation />
                {session && (
                    <div className={styles.addProuctLinkWrapper}>
                        <Link className={styles.addProuctLink} href='/products/add'>
                            <PlusIcon className={styles.plusIcon} />
                            <span>Добавить товар</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPanel