'use client';

import { useState, useTransition } from 'react';
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/Button/Button';

interface LogoutButtonProps {
    className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [hasError, setHasError] = useState(false);

    return (
        <Button 
            type="button"
            className={className}
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    setHasError(false);

                    try {
                        await logout();
                        window.location.reload();
                    } catch {
                        setHasError(true);
                    }
                });
            }}
        >
            {isPending ? 'Выходим…' : 'Выйти'}
            {hasError && <span role="alert"> Не удалось завершить выход.</span>}
        </Button>
    );
}
