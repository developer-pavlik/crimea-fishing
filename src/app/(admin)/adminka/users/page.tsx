import type { Metadata } from 'next';
import AdminUsers from '@/components/AdminUsers/AdminUsers';

export const metadata: Metadata = {
    title: 'Пользователи — Админ-панель',
};

export default function AdminUsersPage() {
    return <AdminUsers />;
}
