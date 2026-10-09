'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { handleTelegramAuth } from '@/actions/auth';

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_TELEGRAM;

if (!clientId) {
    throw new Error('NEXT_PUBLIC_CLIENT_ID_TELEGRAM is not configured');
}

declare global {
    interface Window {
        onTelegramAuth?: (data: TelegramAuthResult) => Promise<void>;
    }
}

type TelegramAuthResult =
    | { id_token: string; user: Record<string, unknown> }
    | { error: string };

export default function TelegramAuthButton() {
    const [error, setError] = useState('');

    useEffect(() => {
        window.onTelegramAuth = async (data) => {
            if ('error' in data) {
                setError('Не удалось войти через Telegram');
                return;
            }

            setError('');

            try {
                const result = await handleTelegramAuth({ id_token: data.id_token });

                if (!result.success) {
                    setError(result.error);
                    return;
                }
            } catch {
                setError('Не удалось завершить вход. Попробуйте позже.');
            }
        };

        return () => {
            delete window.onTelegramAuth;
        };
    }, []);

    return (
        <>
            <Script
                async
                src="https://oauth.telegram.org/js/telegram-login.js?6"
                data-client-id={clientId}
                data-onauth="window.onTelegramAuth(data)"
                data-request-access="write"
            />
            <button className="tg-auth-button">Войти через Telegram</button>
            {error && <p role="alert">{error}</p>}
        </>
    );
}
