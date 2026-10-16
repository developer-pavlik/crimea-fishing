"use client";

import { useState, useTransition } from "react";
import { setFavorite } from "@/actions/favorites";
import styles from './ProductFavoriteButton.module.scss'
import FavoritesIcon from '../../../public/icons/heart.svg';
import cn from "clsx";

interface ProductFavoriteButtonProps {
    productId: string;
    isFavorite: boolean;
    className?: string;
    onFavoriteChange?: (isFavorite: boolean) => void;
}

const ProductFavoriteButton = ({
    productId,
    isFavorite,
    className,
    onFavoriteChange,
}: ProductFavoriteButtonProps) => {
    const [isPending, startTransition] = useTransition();
    const [favorite, setFavoriteState] = useState(isFavorite);
    const [error, setError] = useState<string | null>(null);

    const handleClick = () => {
        const nextIsFavorite = !favorite;
        setError(null);

        startTransition(async () => {
            try {
                const result = await setFavorite(productId, nextIsFavorite);

                if (!result.success) {
                    setError(
                        result.error === "unauthorized"
                            ? "Войдите, чтобы изменить избранное."
                            : result.error === "product_not_found"
                              ? "Этот товар больше недоступен."
                              : "Не удалось изменить избранное.",
                    );
                    return;
                }

                setFavoriteState(nextIsFavorite);
                onFavoriteChange?.(nextIsFavorite);
            } catch {
                setError("Не удалось изменить избранное. Попробуйте ещё раз.");
            }
        });
    };

    return (
        <div className={cn(styles.favoriteButtonRoot, className)}>
            <button
                type="button"
                className={cn(styles.favoriteButton, { [styles.favoriteButton_active]: favorite })}
                aria-label={favorite ? "Удалить из избранного" : "Добавить в избранное"}
                aria-pressed={favorite}
                aria-busy={isPending}
                disabled={isPending}
                onClick={handleClick}
            >
                <FavoritesIcon className={styles.favoriteIcon} />
            </button>
            {error && <span className={styles.favoriteError} role="alert">{error}</span>}
        </div>
    );
};

export default ProductFavoriteButton