import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/logo.png';
import userIcon from '../../../public/icons/user.svg';
import styles from './Header.module.scss'
import SearchInput from '../ui/SearchInput/SearchInput';

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
                <SearchInput />
                <Link className={styles.personalAccount} href="/">
                    <Image
                    src={userIcon}
                    alt="Личный кабинет"
                    className={styles.userIcon}
                    priority
                    />
                    <span>Кабинет</span>
                </Link>
            </div>
        </div>
    </header>
);

export default Header