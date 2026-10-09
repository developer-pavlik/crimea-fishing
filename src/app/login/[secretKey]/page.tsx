import { notFound } from 'next/navigation';
import styles from "./page.module.scss";
import TelegramAuthButton from '@/components/TelegramAuthButton/TelegramAuthButton';
import LogoutButton from '@/components/LogoutButton/LogoutButton';
import { getAccessSession } from '@/lib/auth';

interface Props {
    params: Promise<{ secretKey: string }>;
}

export default async function LoginPage({ params }: Props) {
    const { secretKey } = await params;

    if (secretKey !== process.env.LOGIN_SECRET_KEY) {
        notFound(); 
    }

    const session = await getAccessSession();

    return (
        <main className={styles.lp}>
            {session ? (
                <>
                    <div className={styles.ltitle}>Вы авторизованы</div>
                    <LogoutButton />
                </>
            ) : (
                <>
                    <div className={styles.ltitle}>Для входа в систему используйте кнопку ниже</div>
                    <TelegramAuthButton />
                </>
            )}
        </main>
    );
}