import styles from './AdminDashboard.module.scss';

export default function AdminDashboard() {
    return (
        <div className={styles.dashboard}>
            <h1 className={styles.heading}>Добро пожаловать в админ-панель</h1>
            <p className={styles.subtitle}>
                Выберите раздел в меню слева для управления платформой
            </p>
        </div>
    );
}
