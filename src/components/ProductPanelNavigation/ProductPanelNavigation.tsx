'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './ProductPanelNavigation.module.scss';

const links = [
    { title: 'Все товары', href: '/' },
    { title: 'Б/У', href: '/products/used' },
    { title: 'Новое', href: '/products/new' },
    { title: 'Халява', href: '/products/free' },
];

const ProductPanelNavigation = () => {
    const pathname = usePathname();

    return (
        <div className={styles.links}>
            {links.map((link) => {
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        scroll={false}
                        onNavigate={() => {
                            if (!isActive) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        className={`${styles.link} ${isActive ? styles.link_active : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {link.title}
                    </Link>
                );
            })}
        </div>
    );
};

export default ProductPanelNavigation;
