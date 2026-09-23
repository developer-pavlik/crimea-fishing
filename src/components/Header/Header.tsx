import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/logo.png';
import styles from './Header.module.scss'

const Header = () => (
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
                тест
            </div>
        </div>
    </header>
);

export default Header