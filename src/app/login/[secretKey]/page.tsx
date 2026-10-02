import { notFound } from 'next/navigation';
import styles from "./page.module.scss";
import Script from 'next/script';

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
            <Script async src="https://oauth.telegram.org/js/telegram-login.js?6" data-client-id="8910582200" data-onauth="console.log(data)" data-request-access="write"></Script>
            <button className="tg-auth-button">Войти через Telegram</button>
        </main>
    );
}