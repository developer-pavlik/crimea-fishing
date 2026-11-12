export type SearchConditionFilter = "any" | "new" | "used";

export interface SearchFilters {
    priceFrom: number | null;
    priceTo: number | null;
    onlyFree: boolean;
    condition: SearchConditionFilter;
    onlyWithPhoto: boolean;
}

export const EMPTY_SEARCH_FILTERS: SearchFilters = {
    priceFrom: null,
    priceTo: null,
    onlyFree: false,
    condition: "any",
    onlyWithPhoto: false,
};

type ParamValue = string | string[] | null | undefined;

function first(value: ParamValue) {
    return Array.isArray(value) ? value[0] : value;
}

function parsePrice(value: ParamValue): number | null {
    const raw = first(value)?.trim();

    if (!raw || !/^\d{1,15}$/.test(raw)) {
        return null;
    }

    const price = Number(raw);

    return Number.isSafeInteger(price) ? price : null;
}

export function parseSearchFilters(
    get: (key: string) => ParamValue,
): SearchFilters {
    const onlyFree = first(get("free")) === "1";
    let priceFrom = onlyFree ? null : parsePrice(get("priceFrom"));
    let priceTo = onlyFree ? null : parsePrice(get("priceTo"));

    if (priceFrom !== null && priceTo !== null && priceFrom > priceTo) {
        priceFrom = null;
        priceTo = null;
    }

    const condition = first(get("condition"));

    return {
        priceFrom,
        priceTo,
        onlyFree,
        condition: condition === "new" || condition === "used" ? condition : "any",
        onlyWithPhoto: first(get("photo")) === "1",
    };
}

export function setSearchFilterParams(
    params: URLSearchParams,
    filters: SearchFilters,
) {
    if (filters.onlyFree) {
        params.set("free", "1");
    } else {
        if (filters.priceFrom !== null) {
            params.set("priceFrom", String(filters.priceFrom));
        }
        if (filters.priceTo !== null) {
            params.set("priceTo", String(filters.priceTo));
        }
    }
    if (filters.condition !== "any") params.set("condition", filters.condition);
    if (filters.onlyWithPhoto) params.set("photo", "1");
}

export function hasActiveSearchFilters(filters: SearchFilters) {
    return (
        filters.priceFrom !== null ||
        filters.priceTo !== null ||
        filters.onlyFree ||
        filters.condition !== "any" ||
        filters.onlyWithPhoto
    );
}
