"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "search-history";
const MAX_ITEMS = 10;

function read(): string[] {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

        return Array.isArray(parsed)
            ? parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_ITEMS)
            : [];
    } catch {
        return [];
    }
}

function write(items: string[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // localStorage недоступен — история просто не сохраняется
    }
}

export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistory(read());
    }, []);

    const add = useCallback((query: string) => {
        const next = [query, ...read().filter((v) => v !== query)].slice(0, MAX_ITEMS);
        write(next);
        setHistory(next);
    }, []);

    const remove = useCallback((query: string) => {
        const next = read().filter((v) => v !== query);
        write(next);
        setHistory(next);
    }, []);

    return { history, add, remove };
}
