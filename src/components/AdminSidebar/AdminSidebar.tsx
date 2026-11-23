'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo/Logo';
import styles from './AdminSidebar.module.scss';
import ExitIcon from '../../../public/icons/exit.svg';
import CategoryIcon from '../../../public/icons/category.svg';
import BoxIcon from '../../../public/icons/box.svg';
import ImgIcon from '../../../public/icons/img.svg';
import MainIcon from '../../../public/icons/main.svg';
import UsersIcon from '../../../public/icons/users.svg';

const navItems = [
    {
        label: 'Главная',
        href: '/adminka',
        icon: <MainIcon />,
    },
    {
        label: 'Пользователи',
        href: '/adminka/users',
        icon: <UsersIcon/>,
    },
    {
        label: 'Продукты',
        href: '/adminka/products',
        icon: <BoxIcon />,
    },
    {
        label: 'Категории',
        href: '/adminka/categories',
        icon: <CategoryIcon />,
    },
    {
        label: 'Баннеры',
        href: '/adminka/banners',
        icon: <ImgIcon />
    },
];

const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <Logo isAdmin />
                <Link className={styles.backLink} href='/'>
                    <ExitIcon className={styles.backLinkIcon}/>
                </Link>
            </div>
            <nav className={styles.nav}>
                <ul className={styles.list}>
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/adminka'
                                ? pathname === '/adminka'
                                : pathname.startsWith(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`${styles.link} ${isActive ? styles.active : ''}`}
                                >
                                    <span className={styles.icon}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
