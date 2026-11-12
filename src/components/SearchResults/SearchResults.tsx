"use client";

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import InfiniteProductGrid from '@/components/InfiniteProductGrid/InfiniteProductGrid';
import Select from '@/components/ui/Select/Select';
import type { ProductPage } from '@/types/product-catalog';
import styles from './SearchResults.module.scss';

type SortValue = 'relevance' | 'price_asc' | 'price_desc';

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
    { value: 'relevance', label: 'По умолчанию' },
    { value: 'price_asc', label: 'Сначала недорогие' },
    { value: 'price_desc', label: 'Сначала дорогие' },
];

const sortSelectClassNames = {
    field: styles.sortSelectField,
    select: styles.sortSelect,
};

interface SearchResultsProps {
    initialPage: ProductPage;
    query: string;
    sort: SortValue;
    isAuthenticated: boolean;
}

const SearchResults = ({
    initialPage,
    query,
    sort,
    isAuthenticated,
}: SearchResultsProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSortChange = (value: SortValue) => {
        if (value === sort) return;

        const params = new URLSearchParams({ q: query });
        if (value !== 'relevance') params.set('sort', value);

        startTransition(() => {
            router.replace(`/search?${params.toString()}`, { scroll: false });
        });
    };

    const productsParams = new URLSearchParams({ q: query, sort });

    return (
        <div className={styles.searchResults}>
            <div className={styles.sidebar}>Тут будут фильтры</div>
            <div className={styles.content} aria-busy={isPending}>
                <Select
                    label="Сортировка"
                    options={SORT_OPTIONS}
                    classNames={sortSelectClassNames}
                    value={sort}
                    onChange={handleSortChange}
                />
                <InfiniteProductGrid
                    key={`${query}|${sort}`}
                    initialPage={initialPage}
                    isAuthenticated={isAuthenticated}
                    productsUrl={`/api/search/products?${productsParams.toString()}`}
                />
            </div>
        </div>
    );
};

export default SearchResults;
