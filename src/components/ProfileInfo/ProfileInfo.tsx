'use client'

import styles from './ProfileInfo.module.scss'
import DefaultUserIcon from '../../../public/icons/fisherman.svg';
import LocationIcon from '../../../public/icons/location.svg';
import { Button } from '@/components/ui/Button/Button'
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import cn from 'clsx';
import EditIcon from '../../../public/icons/edit.svg';
import type { PublicUserProfile } from '@/lib/users';

const links = [
    { title: 'Мои обьявления', href: '/profile' },
    { title: 'Избранное', href: '/profile/favorites' },
];

type ProfileInfoProps = {
    profile: PublicUserProfile;
    isOwnProfile: boolean;
};

const ProfileInfo = ({ profile, isOwnProfile }: ProfileInfoProps) => {
    const pathname = usePathname();
    const avatarUrl = profile.photoUrl?.trim();
    const profileName = profile.username?.trim() || 'Пользователь';

    return (
        <div className={styles.profileInfo}>
            <div className={styles.profileAvatar}>
                <div className={styles.profileAvatarImgWrapper}>
                    {avatarUrl ? (
                        <Image
                            className={styles.profileAvatarImage}
                            src={avatarUrl}
                            alt={`Аватар ${profileName}`}
                            width={140}
                            height={140}
                            unoptimized
                        />
                    ) : (
                        <DefaultUserIcon className={styles.profileDefaultIcon} />
                    )}
                </div>
            </div>
            <div className={styles.profileName}>{profileName}</div>
            <div className={styles.location}>
                <LocationIcon className={styles.locationIcon} />
                <span>Севастополь</span>
            </div>
            <p className={styles.aboutMyself}>Рыбачу на стеньках, ловлю пеламидов и луфарев</p>
            <div className={styles.menu}>
                {isOwnProfile ? (
                    <ul className={styles.menuList}>
                        {links.map((link) => {
                            const isActive = pathname === link.href;

                            return (
                                <li className={styles.menuItem} key={link.href}>
                                    <Link 
                                        href={link.href}
                                        className={cn(styles.menuLink, {[styles.menuLink_active]: isActive})}
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <Button className={styles.writeButton}>Написать продавцу</Button>
                )}
            </div>
            {isOwnProfile && (
                <button className={styles.editButton}>
                    <EditIcon className={styles.editButtonIcon} />
                </button>
            )}
        </div>
    );
};

export default ProfileInfo;
