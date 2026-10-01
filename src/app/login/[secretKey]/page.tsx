import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ secretKey: string }>;
}

export default async function LoginPage({ params }: Props) {
    const { secretKey } = await params;

    if (secretKey !== process.env.LOGIN_SECRET_KEY) {
        notFound(); 
    }

    return (
        <main>
        <h1>Секретный вход в систему</h1>
        {/* Ваша форма логина */}
        </main>
    );
}