'use server';

const jwksUrl = process.env.TELEGRAM_JWKS_URL;

export async function makeTestRequest() {
    if (!jwksUrl) {
        throw new Error('TELEGRAM_JWKS_URL is not configured');
    }

    const response = await fetch(jwksUrl, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Failed to fetch Telegram JWKS: ${response.status}`);
    }

    const jwks: unknown = await response.json();
    console.log('Telegram JWKS:', jwks);
}