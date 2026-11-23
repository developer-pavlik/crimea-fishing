import Image from 'next/image';
import Link from 'next/link';
import logo from '../../../public/logo.png';
import styles from './Logo.module.scss';

type LogoProps = {
    isAdmin?: boolean;
};

const Logo = ({ isAdmin = false }: LogoProps) => (
    <Link
        className={styles.logo}
        href={isAdmin ? '/adminka' : '/'}
        aria-label={isAdmin ? 'Админ-панель — на главную' : 'Fishing Market — главная'}
    >
        <Image
            src={logo}
            alt=""
            width={64}
            height={64}
            className={styles.logoImg}
            priority
        />
        <span className={styles.text}>
            <span className={styles.title}>Fishing Market</span>
            <span className={styles.subtitle}>
                {isAdmin ? 'Админ панель' : 'Все для рыбалки'}
            </span>
        </span>
    </Link>
);

export default Logo;
