'use server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const telegramJwksUrl = process.env.TELEGRAM_JWKS_URL;
const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_TELEGRAM;

if (!telegramJwksUrl) {
    throw new Error('TELEGRAM_JWKS_URL is not configured');
}

const telegramJWKS = createRemoteJWKSet(new URL(telegramJwksUrl));



export async function verifyTelegramIdToken(token: string) {
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_CLIENT_ID_TELEGRAM is not configured');
  }

  try {
        const { payload } = await jwtVerify(token, telegramJWKS, {
            issuer: 'https://oauth.telegram.org', 
            audience: clientId,
            clockTolerance: '5m', 
        });

        return payload;
  } catch (error) {
        console.error('Telegram id_token verification failed:', error);
        return null;
  }
}


export async function handleTelegramAuth(data: {
    id_token?: string;
    user?: Record<string, unknown>;
    error?: string;
}) {
    if (!data.id_token) {
        console.error('Telegram authorization response does not contain an id_token');
        return;
    }

    const userPayload = await verifyTelegramIdToken(data.id_token);

    if (userPayload) {
        console.log('Пользователь успешно авторизован:', userPayload); 
    } else {
        console.log('Ошибка авторизации: токен не валиден.');
    }
}
