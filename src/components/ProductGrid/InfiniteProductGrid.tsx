"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import cn from "clsx";
import ProductTile from "../ProductTile/ProductTile";
import type { ProductPage } from "@/types/product-catalog";
import styles from "./ProductGrid.module.scss";

export interface InfiniteProductGridProps {
    className?: string;
    initialPage: ProductPage;
    isAuthenticated: boolean;
}

export default function InfiniteProductGrid({
    className,
    initialPage,
    isAuthenticated,
}: InfiniteProductGridProps) {
    const [items, setItems] = useState(initialPage.items);
    const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
    const [hasMore, setHasMore] = useState(initialPage.hasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);

    const loadMore = useCallback(async () => {
        if (!hasMore || !nextCursor || loadingRef.current) {
            return;
        }

        loadingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/products?cursor=${encodeURIComponent(nextCursor)}`,
            );
            const result: ProductPage | { error?: string } = await response.json();

            if (!response.ok) {
                throw new Error(
                    "error" in result && result.error
                        ? result.error
                        : "Не удалось загрузить товары.",
                );
            }

            if (!("items" in result) || !Array.isArray(result.items)) {
                throw new Error("Сервер вернул некорректный список товаров.");
            }

            setItems((currentItems) => [...currentItems, ...result.items]);
            setNextCursor(result.nextCursor);
            setHasMore(result.hasMore);
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Не удалось загрузить товары. Попробуйте ещё раз.",
            );
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
    }, [hasMore, nextCursor]);

    useEffect(() => {
        const sentinel = sentinelRef.current;

        if (!sentinel || !hasMore || isLoading || error) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                void loadMore();
            }
        });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [error, hasMore, isLoading, loadMore]);

    return (
        <>
            <div className={cn(styles.productGrid, className)}>
                {items.map((item) => (
                    <ProductTile
                        key={item.id}
                        {...item}
                        isAuthenticated={isAuthenticated}
                    />
                ))}
            </div>
            {error ? (
                <div className={styles.loadState} role="alert">
                    <span>{error}</span>
                    <button
                        className={styles.retryButton}
                        type="button"
                        onClick={() => void loadMore()}
                    >
                        Повторить
                    </button>
                </div>
            ) : isLoading ? (
                <div className={styles.loadState} role="status" aria-live="polite">
                    Загружаем товары…
                </div>
            ) : hasMore ? (
                <div
                    ref={sentinelRef}
                    className={styles.loadSentinel}
                    aria-hidden="true"
                />
            ) : items.length === 0 ? (
                <div className={styles.loadState} role="status">
                    Товаров пока нет.
                </div>
            ) : (
                <div className={styles.loadState} role="status">
                    Вы посмотрели все товары.
                </div>
            )}
        </>
    );
}
