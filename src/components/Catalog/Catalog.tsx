"use client";

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import InfiniteProductGrid from '@/components/InfiniteProductGrid/InfiniteProductGrid';
import SearchFilters from '@/components/SearchFilters/SearchFilters';
import Select from '@/components/ui/Select/Select';
import { setSearchFilterParams, type SearchFilters as SearchFiltersValue } from '@/lib/search-filters';
import type { ProductPage } from '@/types/product-catalog';
import styles from './Catalog.module.scss';
import Backlink from '@/components/Backlink/Backlink';

type SortValue = 'date' | 'price_asc' | 'price_desc';

const DEFAULT_SORT: SortValue = 'date';

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
    { value: 'date', label: 'Сначала новые' },
    { value: 'price_asc', label: 'Сначала недорогие' },
    { value: 'price_desc', label: 'Сначала дорогие' },
];

const sortSelectClassNames = {
    field: styles.sortSelectField,
    select: styles.sortSelect,
};

interface CatalogProps {
    category: { name: string; slug: string };
    initialPage: ProductPage;
    sort: SortValue;
    filters: SearchFiltersValue;
    isAuthenticated: boolean;
}

const Catalog = ({
    category,
    initialPage,
    sort,
    filters,
    isAuthenticated,
}: CatalogProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const slug = encodeURIComponent(category.slug);

    const navigate = (nextSort: SortValue, nextFilters: SearchFiltersValue) => {
        const params = new URLSearchParams();
        if (nextSort !== DEFAULT_SORT) params.set('sort', nextSort);
        setSearchFilterParams(params, nextFilters);
        const query = params.toString();

        startTransition(() => {
            router.replace(`/catalog/${slug}${query ? `?${query}` : ''}`, { scroll: false });
        });
    };

    const handleSortChange = (value: SortValue) => {
        if (value === sort) return;
        navigate(value, filters);
    };

    const handleFiltersChange = (nextFilters: SearchFiltersValue) => {
        navigate(sort, nextFilters);
    };

    const productsParams = new URLSearchParams({ sort });
    setSearchFilterParams(productsParams, filters);

    return (
        <div className={styles.catalog}>    
            <div className={styles.titleWrapper}>
                <Backlink />
                <h1 className={styles.title}>{category.name}</h1>
            </div>

            <div className={styles.box}>
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
                        productsUrl={`/api/catalog/${slug}/products?${productsParams.toString()}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default Catalog;
