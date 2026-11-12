"use client";

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import InfiniteProductGrid from '@/components/InfiniteProductGrid/InfiniteProductGrid';
import SearchFilters from '@/components/SearchFilters/SearchFilters';
import Select from '@/components/ui/Select/Select';
import { setSearchFilterParams, type SearchFilters as SearchFiltersValue } from '@/lib/search-filters';
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
    filters: SearchFiltersValue;
    isAuthenticated: boolean;
}

const SearchResults = ({
    initialPage,
    query,
    sort,
    filters,
    isAuthenticated,
}: SearchResultsProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const navigate = (nextSort: SortValue, nextFilters: SearchFiltersValue) => {
        const params = new URLSearchParams({ q: query });
        if (nextSort !== 'relevance') params.set('sort', nextSort);
        setSearchFilterParams(params, nextFilters);

        startTransition(() => {
            router.replace(`/search?${params.toString()}`, { scroll: false });
        });
    };

    const handleSortChange = (value: SortValue) => {
        if (value === sort) return;
        navigate(value, filters);
    };

    const handleFiltersChange = (nextFilters: SearchFiltersValue) => {
        navigate(sort, nextFilters);
    };

    const productsParams = new URLSearchParams({ q: query, sort });
    setSearchFilterParams(productsParams, filters);

    return (
        <div className={styles.searchResults}>
            <div className={styles.sidebar}>
                <SearchFilters filters={filters} onChange={handleFiltersChange} />
            </div>
            <div className={styles.content} aria-busy={isPending}>
                <Select
                    label="Сортировка"
                    options={SORT_OPTIONS}
                    classNames={sortSelectClassNames}
                    value={sort}
                    onChange={handleSortChange}
                />
                <InfiniteProductGrid
                    key={productsParams.toString()}
                    initialPage={initialPage}
                    isAuthenticated={isAuthenticated}
                    productsUrl={`/api/search/products?${productsParams.toString()}`}
                />
            </div>
        </div>
    );
};

export default SearchResults;
