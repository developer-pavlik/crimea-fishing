import { notFound } from 'next/navigation';
import styles from "./page.module.scss";
import TelegramAuthButton from '@/components/TelegramAuthButton/TelegramAuthButton';

interface Props {
    params: Promise<{ secretKey: string }>;
}

export default async function LoginPage({ params }: Props) {
    const { secretKey } = await params;

    if (secretKey !== process.env.LOGIN_SECRET_KEY) {
        notFound(); 
    }

    return (
        <main className={styles.lp}>
            <div className={styles.ltitle}>Для входа в систему используйте кнопку ниже</div>
            <TelegramAuthButton />
        </main>
    );
}