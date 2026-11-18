import styles from './Footer.module.scss'
import Logo from '../Logo/Logo';

const Footer = () => (
    <footer className={styles.footer}>
        <div className='container'>
            <div className={styles.inner}>
                <div className={styles.brandBlock}>
                    <Logo/>
                    <p className={styles.description}>
                        Fishing Market — место, где снасти обретают вторую жизнь.
                        Продавай то, что лежит без дела, находи то, о чём давно мечтал.
                        Сделано рыбаками для рыбаков.
                    </p>
                </div>
                <div className={styles.contacts}>
                    <h4 className={styles.contactsTitle}>Контакты</h4>
                    <ul className={styles.contactsList}>
                        <li>
                            <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                            <div>
                                <span className={styles.contactLabel}>Почта</span>
                                <a href="mailto:developer.pavlik@gmail.com">developer.pavlik@gmail.com</a>
                            </div>
                        </li>
                        <li>
                            <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                            <div>
                                <span className={styles.contactLabel}>Телеграм</span>
                                <a href="https://t.me/good_robin" target="_blank" rel="noopener noreferrer">t.me/good_robin</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={styles.bottomSection}>
                <span className={styles.copyright}>© {new Date().getFullYear()} Все права защищены</span>
                <nav className={styles.legalLinks}>
                    <a href="">Политика конфиденциальности</a>
                    <a href="">Пользовательское соглашение</a>
                    <a href="">Согласие на обработку персональных данных</a>
                    <a href="">Политика в отношении обработки персональных данных</a>
                    <a href="">Публичная оферта</a>
                </nav>
            </div>
        </div>
    </footer>
);

export default Footer