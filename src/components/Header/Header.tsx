import Link from 'next/link';
import Image from 'next/image';
import { eq } from 'drizzle-orm';
import UserIcon from '../../../public/icons/user.svg';
import GearIcon from '../../../public/icons/gear.svg';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getAccessSession } from '@/lib/auth';
import styles from './Header.module.scss';
import Search from '../Search/Search';
import ProductCategoriesMenu from '../ProductCategoriesMenu/ProductCategoriesMenu';
import Logo from '../Logo/Logo';

const Header = async () => {
    const session = await getAccessSession();
    const [user] = session
        ? await db
            .select({ photoUrl: users.photoUrl, role: users.role })
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1)
        : [];
    const avatarUrl = user?.photoUrl?.trim();
    const isAdmin = !!user?.role && ['moderator', 'admin', 'superadmin'].includes(user.role);

    return (
        <header className={styles.header}>
            <div className='container'>
                <div className={styles.inner}>
                    <Logo />
                    <ProductCategoriesMenu />
                    <Search />
                    {session && (
                        <Link className={styles.personalAccount} href="/profile">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Аватар пользователя"
                                    className={styles.avatar}
                                    width={54}
                                    height={54}
                                    unoptimized
                                />
                            ) : (
                                <UserIcon className={styles.userIcon} />
                            )}
                        </Link>
                    )}
                    {session && isAdmin && (
                        <Link className={styles.adminLink} href="/adminka">
                            <GearIcon className={styles.adminIcon} />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;