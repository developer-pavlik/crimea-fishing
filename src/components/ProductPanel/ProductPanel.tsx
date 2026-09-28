'use client';
import PlusIcon from '../../../public/icons/plus.svg';

import styles from './ProductPanel.module.scss'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
    { title: 'Все товары', href: '/' },
    { title: 'Б/У', href: '/products/used' },
    { title: 'Новое', href: '/products/new' },
    { title: 'Халява', href: '/products/free' },
];

const ProductPanel = () => {
    const pathname = usePathname();

    return (
        <div className={styles.panel}>
            <div className={styles.partOne}>
                {links.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.link} ${isActive ? styles.link_active : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {link.title}
                        </Link>
                    );
                })}
            </div>
            <div className={styles.partTwo}>
                <Link className={styles.addProuctLink} href='/add-product'>
                    <PlusIcon className={styles.plusIcon}  />
                    <span>Добавить товар</span>
                </Link>
            </div>
        </div>
    );
};

export default ProductPanel