import AdminUsersFilters from './AdminUsersFilters/AdminUsersFilters';
import styles from './AdminUsersTable.module.scss';

export default function AdminUsersTable() {
    return (
        <div className={styles.tableWrapper}>
            <AdminUsersFilters />
            {/* Здесь будет сама таблица пользователей */}
        </div>
    );
}
