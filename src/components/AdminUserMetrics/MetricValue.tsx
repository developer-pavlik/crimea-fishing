import { getUserMetrics, type UserMetrics } from '@/lib/admin-metrics';
import styles from './AdminUserMetrics.module.scss';

const numberFormat = new Intl.NumberFormat('ru-RU');

export default async function MetricValue({ metricKey }: { metricKey: keyof UserMetrics }) {
    const metrics = await getUserMetrics();

    return (
        <span className={styles.value}>
            {metrics ? numberFormat.format(metrics[metricKey]) : '—'}
        </span>
    );
}

export function MetricValueSkeleton() {
    return (
        <span className={styles.valueSkeleton} role="status" aria-busy="true">
            <span className={styles.srOnly}>Загрузка…</span>
        </span>
    );
}
