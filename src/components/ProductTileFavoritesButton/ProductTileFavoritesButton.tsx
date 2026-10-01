"use client";

import styles from './ProductTileFavoritesButton.module.scss'
import FavoritesIcon from '../../../public/icons/heart.svg';
import cn from "clsx";

interface ProductTileFavoritesButtonProps {
    isFavorite: boolean;
    onFavoriteChange?: (isFavorite: boolean) => void;
}

const ProductTileFavoritesButton = ({
    isFavorite,
    onFavoriteChange,
}: ProductTileFavoritesButtonProps) => {
    const handleClick = () => {
        const nextIsFavorite = !isFavorite;
        onFavoriteChange?.(nextIsFavorite);
    };

    return (
        <button
            type="button"
            className={cn(styles.favoritesButton, { [styles.favoritesButton_active]: isFavorite })}
            aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            aria-pressed={isFavorite}
            onClick={handleClick}
        >
            <FavoritesIcon className={styles.favoritesIcon} />
        </button>
    );
};

export default ProductTileFavoritesButton