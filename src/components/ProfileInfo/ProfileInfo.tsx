'use client'

import styles from './ProfileInfo.module.scss'
import DefaultUserIcon from '../../../public/icons/fisherman.svg';
import LocationIcon from '../../../public/icons/location.svg';
import { Button } from '@/components/ui/Button/Button'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import cn from 'clsx';
import EditIcon from '../../../public/icons/edit.svg';

const links = [
    { title: 'Мои обьявления', href: '/profile' },
    { title: 'Избранное', href: '/profile/favorites' },
];

const ProfileInfo = () => {
    const pathname = usePathname();

    return (
        <div className={styles.profileInfo}>
            <div className={styles.profileAvatar}>
                <div className={styles.profileAvatarImgWrapper}>
                    <DefaultUserIcon className={styles.profileDefaultIcon} />
                </div>
            </div>
            <div className={styles.profileName}>Макс Сарган</div>
            <div className={styles.location}>
                <LocationIcon className={styles.locationIcon} />
                <span>Севастополь</span>
            </div>
            <p className={styles.aboutMyself}>Рыбачу на стеньках, ловлю пеламидов и луфарев</p>
            <div className={styles.menu}>
                <Button className={styles.writeButton}>Написать продавцу</Button>
                <ul className={styles.menuList}>
                    {links.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(styles.menuLink, {[styles.menuLink_active]: isActive})}
                            >
                                {link.title}
                            </Link>
                        );
                    })}
                </ul>
            </div>
            <button className={styles.editButton}>
                <EditIcon className={styles.editButtonIcon} />
            </button>
        </div>
    );
};

export default ProfileInfo;
