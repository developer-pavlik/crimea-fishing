import type { Metadata } from "next";
import { getAccessSession } from "@/lib/auth";
import {
    countSearchProducts,
    getInitialSearchProductPage,
    normalizeSearchQuery,
    parseSearchSort,
} from "@/lib/search";
import type { ProductPage } from "@/types/product-catalog";
import { pluralizeRu } from "@/lib/pluralize";
import SearchResults from "@/components/SearchResults/SearchResults";

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
    searchParams,
}: SearchPageProps): Promise<Metadata> {
    const query = normalizeSearchQuery((await searchParams).q);

    return { title: query ? `Поиск: ${query}` : "Поиск" };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = normalizeSearchQuery((await searchParams).q);

    if (!query) {
        return (
            <section>
                <h1>Введите поисковый запрос</h1>
            </section>
        );
    }

    const sort = parseSearchSort((await searchParams).sort);
    const session = await getAccessSession();
    let count: number;
    let initialPage: ProductPage | null = null;

    try {
        const [countResult, pageResult] = await Promise.all([
            countSearchProducts(query),
            getInitialSearchProductPage({
                query,
                sort,
                viewerId: session?.userId,
            }),
        ]);
        count = countResult;
        initialPage = pageResult.ok ? pageResult.page : null;
    } catch {
        return (
            <section role="alert">
                <h1>Не удалось выполнить поиск</h1>
                <p>Попробуйте повторить запрос позже.</p>
            </section>
        );
    }

    if (!initialPage) {
        return (
            <section role="alert">
                <h1>Не удалось выполнить поиск</h1>
                <p>Попробуйте повторить запрос позже.</p>
            </section>
        );
    }

    return (
        <>
            <section>
                <h1>
                    Найдено {count} {pluralizeRu(count, ["товар", "товара", "товаров"])} по
                    запросу «{query}»
                </h1>
            </section>
            <SearchResults
                initialPage={initialPage}
                query={query}
                sort={sort}
                isAuthenticated={!!session}
            />
        </>
    );
}
