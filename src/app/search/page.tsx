import type { Metadata } from "next";
import { countSearchProducts, normalizeSearchQuery } from "@/lib/search";
import { pluralizeRu } from "@/lib/pluralize";

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

    let count: number;

    try {
        count = await countSearchProducts(query);
    } catch {
        return (
            <section role="alert">
                <h1>Не удалось выполнить поиск</h1>
                <p>Попробуйте повторить запрос позже.</p>
            </section>
        );
    }

    return (
        <section>
            <h1>
                Найдено {count} {pluralizeRu(count, ["товар", "товара", "товаров"])} по
                запросу «{query}»
            </h1>
        </section>
    );
}
