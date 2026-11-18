import Image from 'next/image';
import Link from 'next/link';
import logo from '../../../public/logo.png';
import styles from './Logo.module.scss';

const Logo = () => (
    <Link className={styles.logo} href="/" aria-label="Fishing Market — главная">
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
            <span className={styles.subtitle}>Все для рыбалки</span>
        </span>
    </Link>
);

export default Logo;
