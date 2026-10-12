import Link from 'next/link';
import Image from 'next/image';
import { eq } from 'drizzle-orm';
import logo from '../../../public/logo.png';
import UserIcon from '../../../public/icons/user.svg';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getAccessSession } from '@/lib/auth';
import styles from './Header.module.scss';
import SearchInput from '../ui/SearchInput/SearchInput';

const Header = async () => {
    const session = await getAccessSession();
    const [user] = session
        ? await db
            .select({ photoUrl: users.photoUrl })
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1)
        : [];
    const avatarUrl = user?.photoUrl?.trim();

    return (
        <header className={styles.header}>
            <div className='container'>
                <div className={styles.inner}>
                    <Link className={styles.logo} href="/">
                        <Image
                            src={logo}
                            alt="Крымская рыбалка"
                            className={styles.logoImg}
                            priority
                        />
                    </Link>
                    <SearchInput />
                    {session && (
                        <Link className={styles.personalAccount} href="/">
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
                </div>
            </div>
        </header>
    );
};

export default Header;