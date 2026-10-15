"use client";

import { useState, useTransition } from "react";
import { setFavorite } from "@/actions/favorites";
import styles from './ProductTileFavoritesButton.module.scss'
import FavoritesIcon from '../../../public/icons/heart.svg';
import cn from "clsx";

interface ProductTileFavoritesButtonProps {
    productId: string;
    isFavorite: boolean;
    onFavoriteChange?: (isFavorite: boolean) => void;
}

const ProductTileFavoritesButton = ({
    productId,
    isFavorite,
    onFavoriteChange,
}: ProductTileFavoritesButtonProps) => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleClick = () => {
        const nextIsFavorite = !isFavorite;
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

                onFavoriteChange?.(nextIsFavorite);
            } catch {
                setError("Не удалось изменить избранное. Попробуйте ещё раз.");
            }
        });
    };

    return (
        <>
            <button
                type="button"
                className={cn(styles.favoritesButton, { [styles.favoritesButton_active]: isFavorite })}
                aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                aria-pressed={isFavorite}
                aria-busy={isPending}
                disabled={isPending}
                onClick={handleClick}
            >
                <FavoritesIcon className={styles.favoritesIcon} />
            </button>
            {error && <span className={styles.favoritesError} role="alert">{error}</span>}
        </>
    );
};

export default ProductTileFavoritesButton