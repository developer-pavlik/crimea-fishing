"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import cn from "clsx";
import ProductTile from "../ProductTile/ProductTile";
import type { ProductPage } from "@/types/product-catalog";
import styles from "./ProductGrid.module.scss";

const MAX_AUTOMATIC_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 1_000;
const RETRY_BASE_DELAY_MS = 500;

class ProductLoadError extends Error {
    constructor(
        message: string,
        readonly retryable = false,
    ) {
        super(message);
        this.name = "ProductLoadError";
    }
}

function isRetryableStatus(status: number): boolean {
    return status === 408 || status === 429 || status >= 500;
}

function isProductPage(value: unknown): value is ProductPage {
    return (
        typeof value === "object" &&
        value !== null &&
        "items" in value &&
        Array.isArray(value.items) &&
        "nextCursor" in value &&
        (typeof value.nextCursor === "string" || value.nextCursor === null) &&
        "hasMore" in value &&
        typeof value.hasMore === "boolean"
    );
}

function getResponseError(value: unknown): string | undefined {
    if (
        typeof value === "object" &&
        value !== null &&
        "error" in value &&
        typeof value.error === "string"
    ) {
        return value.error;
    }

    return undefined;
}

function waitForRetry(delay: number, signal: AbortSignal): Promise<boolean> {
    return new Promise((resolve) => {
        const timer = setTimeout(() => finish(true), delay);

        function finish(shouldContinue: boolean) {
            clearTimeout(timer);
            signal.removeEventListener("abort", onAbort);
            resolve(shouldContinue);
        }

        function onAbort() {
            finish(false);
        }

        signal.addEventListener("abort", onAbort, { once: true });
        if (signal.aborted) {
            finish(false);
        }
    });
}

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
    const mountedRef = useRef(false);
    const loadControllerRef = useRef<AbortController | null>(null);
    const requestControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            loadControllerRef.current?.abort();
            requestControllerRef.current?.abort();
        };
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || !nextCursor || loadingRef.current) {
            return;
        }

        const loadController = new AbortController();
        loadControllerRef.current = loadController;
        loadingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            for (
                let retry = 0;
                retry <= MAX_AUTOMATIC_RETRIES;
                retry += 1
            ) {
                if (loadController.signal.aborted || !mountedRef.current) {
                    return;
                }

                const requestController = new AbortController();
                requestControllerRef.current = requestController;
                const abortRequest = () => requestController.abort();
                loadController.signal.addEventListener("abort", abortRequest, {
                    once: true,
                });
                let timedOut = false;
                const timeout = setTimeout(() => {
                    timedOut = true;
                    requestController.abort();
                }, REQUEST_TIMEOUT_MS);

                try {
                    const response = await fetch(
                        `/api/products?cursor=${encodeURIComponent(nextCursor)}`,
                        { signal: requestController.signal },
                    );
                    let result: unknown;

                    try {
                        result = await response.json();
                    } catch {
                        throw new ProductLoadError(
                            response.ok
                                ? "Сервер вернул некорректный список товаров."
                                : "Не удалось загрузить товары. Попробуйте ещё раз.",
                            !response.ok && isRetryableStatus(response.status),
                        );
                    }

                    if (!response.ok) {
                        throw new ProductLoadError(
                            getResponseError(result) ??
                                "Не удалось загрузить товары. Попробуйте ещё раз.",
                            isRetryableStatus(response.status),
                        );
                    }

                    if (!isProductPage(result)) {
                        throw new ProductLoadError(
                            "Сервер вернул некорректный список товаров.",
                        );
                    }

                    if (loadController.signal.aborted || !mountedRef.current) {
                        return;
                    }

                    setItems((currentItems) => [
                        ...currentItems,
                        ...result.items,
                    ]);
                    setNextCursor(result.nextCursor);
                    setHasMore(result.hasMore);
                    return;
                } catch (loadError) {
                    if (
                        loadController.signal.aborted ||
                        !mountedRef.current
                    ) {
                        return;
                    }

                    clearTimeout(timeout);

                    const shouldRetry =
                        timedOut ||
                        (loadError instanceof ProductLoadError
                            ? loadError.retryable
                            : loadError instanceof TypeError);

                    if (shouldRetry && retry < MAX_AUTOMATIC_RETRIES) {
                        const delay = RETRY_BASE_DELAY_MS * 2 ** retry;
                        const continueRetrying = await waitForRetry(
                            delay,
                            loadController.signal,
                        );

                        if (continueRetrying) {
                            continue;
                        }

                        return;
                    }

                    setError(
                        timedOut
                            ? "Не удалось загрузить товары: превышено время ожидания."
                            : loadError instanceof ProductLoadError
                              ? loadError.message
                              : "Не удалось загрузить товары. Попробуйте ещё раз.",
                    );
                    return;
                } finally {
                    clearTimeout(timeout);
                    loadController.signal.removeEventListener(
                        "abort",
                        abortRequest,
                    );
                    if (requestControllerRef.current === requestController) {
                        requestControllerRef.current = null;
                    }
                }
            }
        } finally {
            if (loadControllerRef.current === loadController) {
                loadControllerRef.current = null;
            }
            loadingRef.current = false;
            if (mountedRef.current) {
                setIsLoading(false);
            }
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
