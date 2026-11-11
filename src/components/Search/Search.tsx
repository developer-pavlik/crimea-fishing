'use client';

import { useEffect, useId, useState } from 'react';
import type { ChangeEvent, SubmitEvent, KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Search.module.scss'
import SearchInput from '../ui/SearchInput/SearchInput';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import { useSearchHistory } from '@/hooks/useSearchHistory';

const MIN_SUGGEST_LENGTH = 2;
const DEBOUNCE_MS = 250;

const Search = () => {
    const router = useRouter();
    const listId = useId();
    const urlQuery = useSearchParams().get('q') ?? '';
    const [value, setValue] = useState(urlQuery);
    const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { history, add, remove } = useSearchHistory();

    // Синхронизируем поле с ?q= при навигации.
    if (urlQuery !== lastUrlQuery) {
        setLastUrlQuery(urlQuery);
        setValue(urlQuery);
    }

    const trimmed = value.trim();
    const isSuggesting = trimmed.length >= MIN_SUGGEST_LENGTH;

    useEffect(() => {
        if (!isSuggesting) return;

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search/suggestions?q=${encodeURIComponent(trimmed)}`,
                    { signal: controller.signal },
                );
                if (!res.ok) throw new Error();
                const data: { suggestions?: string[] } = await res.json();
                setSuggestions(data.suggestions ?? []);
            } catch {
                if (!controller.signal.aborted) setSuggestions([]);
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [trimmed, isSuggesting]);

    // Пустое поле — история; иначе — подсказки.
    const items = !trimmed
        ? history.map((v) => ({ value: v, removable: true }))
        : isSuggesting
            ? suggestions.map((v) => ({ value: v }))
            : [];
    const showDropdown = open && items.length > 0;

    const close = () => {
        setOpen(false);
        setActiveIndex(-1);
    };

    const submit = (raw: string) => {
        const query = raw.replace(/\s+/g, ' ').trim();
        if (!query) return;
        add(query);
        setValue(query);
        close();
        (document.activeElement as HTMLElement | null)?.blur();
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        submit(activeIndex >= 0 && items[activeIndex] ? items[activeIndex].value : value);
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        setActiveIndex(-1);
        setOpen(true);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            close();
            return;
        }
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && items.length) {
            e.preventDefault();
            setOpen(true);
            // Цикл по позициям: -1 (текст пользователя), 0..n-1 (пункты).
            const total = items.length + 1;
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex((i) => ((i + 1 + step + total) % total) - 1);
        }
    };

    return (
        <form className={styles.search} action="/search" method="get" role="search" onSubmit={onSubmit}>
            <SearchInput
                value={value}
                onChange={onChange}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={showDropdown && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
            />
            {showDropdown && (
                <SearchDropdown
                    id={listId}
                    items={items}
                    activeIndex={activeIndex}
                    onSelect={submit}
                    onRemove={remove}
                    onClose={close}
                />
            )}
        </form>
    );
};

export default Search
