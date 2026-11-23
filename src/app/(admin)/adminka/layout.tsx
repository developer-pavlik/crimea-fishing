import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getAccessSession } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import styles from './layout.module.scss';

export const metadata: Metadata = {
    title: 'Админ-панель — Рыбацкая барахолка',
};

const ADMIN_ROLES = ['moderator', 'admin', 'superadmin'];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getAccessSession();

    if (!session) {
        redirect('/');
    }

    const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    if (!user || !ADMIN_ROLES.includes(user.role)) {
        redirect('/');
    }

    return (
        <div className={styles.adminLayout}>
            <AdminSidebar />
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
