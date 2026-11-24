import AdminUserMetrics from '@/components/AdminUserMetrics/AdminUserMetrics';
import AdminUsersTable from '@/components/AdminUsersTable/AdminUsersTable';
import styles from './AdminUsers.module.scss';

export default function AdminUsers() {
    return (
        <div className={styles.users}> 
            <div>
                <h1 className="adminPanel__title">Пользователи</h1>
                <p className="adminPanel__description"> Управление учетными записями, ролями доступа</p>
            </div>
            <AdminUserMetrics />
            <AdminUsersTable />
        </div>
    );
}
