'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { handleTelegramAuth } from '@/actions/auth';
import { makeTestRequest } from '@/actions/testRequest';

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
    useEffect(() => {
        window.onTelegramAuth = async (data) => {
            await handleTelegramAuth(data);
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
            <button onClick={() => makeTestRequest()}>Тестовая кнопка</button>
        </>
    );
}
