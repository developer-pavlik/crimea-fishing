import React, { Suspense } from 'react';
import UsersIcon from '../../../public/icons/users.svg';
import UserPlusIcon from '../../../public/icons/user-plus.svg';
import StoreIcon from '../../../public/icons/store.svg';
import ShieldUserIcon from '../../../public/icons/shield-user.svg';
import type { UserMetrics } from '@/lib/admin-metrics';
import MetricValue, { MetricValueSkeleton } from './MetricValue';
import styles from './AdminUserMetrics.module.scss';

interface MetricCard {
    id: string;
    key: keyof UserMetrics;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const METRIC_CARDS: MetricCard[] = [
    {
        id: 'total-users',
        key: 'total',
        title: 'Всего пользователей',
        description: 'Зарегистрированных аккаунтов',
        icon: <UsersIcon />,
    },
    {
        id: 'new-weekly',
        key: 'newWeekly',
        title: 'Новые за неделю',
        description: 'Регистрации за последние 7 дней',
        icon: <UserPlusIcon />,
    },
    {
        id: 'active-sellers',
        key: 'activeSellers',
        title: 'Активные продавцы',
        description: 'С опубликованными товарами',
        icon: <StoreIcon />,
    },
    {
        id: 'moderators',
        key: 'team',
        title: 'Команда',
        description: 'Администраторы и модераторы',
        icon: <ShieldUserIcon />,
    },
];

export default function AdminUserMetrics() {
    return (
        <section className={styles.metricsGrid} aria-label="Метрики пользователей">
            {METRIC_CARDS.map((item) => (
                <div key={item.id} className={styles.card}>
                    <div className={styles.top}>
                        <h2 className={styles.title}>{item.title}</h2>
                        <div className={styles.iconWrapper}>
                            {item.icon}
                        </div>
                    </div>

                    <div className={styles.statRow}>
                        <Suspense fallback={<MetricValueSkeleton />}>
                            <MetricValue metricKey={item.key} />
                        </Suspense>
                    </div>

                    <p className={styles.description}>{item.description}</p>
                </div>
            ))}
        </section>
    );
}
