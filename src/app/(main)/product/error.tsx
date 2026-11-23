'use client';

import { useEffect } from 'react';

interface ProductErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ProductError({ error, reset }: ProductErrorProps) {
    useEffect(() => {
        console.error('Product page failed to render', error);
    }, [error]);

    return (
        <section role="alert">
            <h1>Не удалось загрузить товар</h1>
            <p>Попробуйте обновить страницу.</p>
            <button type="button" onClick={reset}>
                Повторить
            </button>
        </section>
    );
}
