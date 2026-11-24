'use client';

import { useState } from 'react';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select, { type SelectClassNames, type SelectOption } from '@/components/ui/Select/Select';
import { Button } from '@/components/ui/Button/Button';
import SearchIcon from '../../../../public/icons/search.svg';
import ResetIcon from '../../../../public/icons/reset.svg';
import styles from './AdminUsersFilters.module.scss';

export interface AdminUsersFiltersProps {
    search?: string;
    role?: string;
    sort?: string;
    onSearchChange?: (value: string) => void;
    onRoleChange?: (value: string) => void;
    onSortChange?: (value: string) => void;
    onReset?: () => void;
}

export const ROLE_OPTIONS: SelectOption[] = [
    { value: 'all', label: 'Все роли' },
    { value: 'user', label: 'Пользователи' },
    { value: 'seller', label: 'Продавцы' },
    { value: 'moderator', label: 'Модераторы' },
    { value: 'admin', label: 'Администраторы' },
];

export const SORT_OPTIONS: SelectOption[] = [
    { value: 'newest', label: 'Сначала новые' },
    { value: 'oldest', label: 'Сначала старые' },
    { value: 'name_asc', label: 'По имени (А-Я)' },
    { value: 'name_desc', label: 'По имени (Я-А)' },
];

const selectClassNames: SelectClassNames = {
    field: styles.selectField,
    select: styles.select,
    popover: styles.popover,
    item: styles.item,
};

export default function AdminUsersFilters({
    search: controlledSearch,
    role: controlledRole,
    sort: controlledSort,
    onSearchChange,
    onRoleChange,
    onSortChange,
    onReset,
}: AdminUsersFiltersProps) {
    const [internalSearch, setInternalSearch] = useState('');
    const [internalRole, setInternalRole] = useState('all');
    const [internalSort, setInternalSort] = useState('newest');

    const search = controlledSearch !== undefined ? controlledSearch : internalSearch;
    const role = controlledRole !== undefined ? controlledRole : internalRole;
    const sort = controlledSort !== undefined ? controlledSort : internalSort;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (controlledSearch === undefined) setInternalSearch(val);
        onSearchChange?.(val);
    };

    const handleRoleChange = (val: string) => {
        if (controlledRole === undefined) setInternalRole(val);
        onRoleChange?.(val);
    };

    const handleSortChange = (val: string) => {
        if (controlledSort === undefined) setInternalSort(val);
        onSortChange?.(val);
    };

    const handleReset = () => {
        if (controlledSearch === undefined) setInternalSearch('');
        if (controlledRole === undefined) setInternalRole('all');
        if (controlledSort === undefined) setInternalSort('newest');
        onReset?.();
    };

    return (
        <div className={styles.container}>
            <div className={styles.search}>
                <SearchIcon className={styles.searchIcon} />
                <TextInput
                    type="text"
                    className={styles.searchInput}
                    placeholder="Поиск по никнейму, ID, Telegram или городу..."
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>

            <div className={styles.controls}>
                <Select
                    options={ROLE_OPTIONS}
                    value={role}
                    onChange={handleRoleChange}
                    classNames={selectClassNames}
                    aria-label="Фильтр по роли"
                />

                <Select
                    options={SORT_OPTIONS}
                    value={sort}
                    onChange={handleSortChange}
                    classNames={selectClassNames}
                    aria-label="Сортировка пользователей"
                />

                <Button
                    type="button"
                    className={styles.resetButton}
                    onClick={handleReset}
                    aria-label="Сбросить фильтры"
                >
                    <ResetIcon className={styles.resetIcon} />
                    <span>Сбросить</span>
                </Button>
            </div>
        </div>
    );
}
