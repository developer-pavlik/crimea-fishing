import { getAccessSession } from "@/lib/auth";
import { getCatalogProductPage, parseCatalogSort } from "@/lib/catalog";
import { getCategoryBySlug } from "@/lib/categories";
import { InvalidProductCursorError } from "@/lib/products";
import { parseSearchFilters } from "@/lib/search-filters";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    const { slug } = await params;
    const searchParams = new URL(request.url).searchParams;

    try {
        const category = await getCategoryBySlug(slug);

        if (!category) {
            return Response.json(
                { error: "Категория не найдена." },
                { status: 404 },
            );
        }

        const session = await getAccessSession();
        const page = await getCatalogProductPage({
            categoryId: category.id,
            sort: parseCatalogSort(searchParams.get("sort")),
            filters: parseSearchFilters((key) => searchParams.get(key)),
            cursor: searchParams.get("cursor"),
            viewerId: session?.userId,
        });

        return Response.json(page);
    } catch (error) {
        if (error instanceof InvalidProductCursorError) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        console.error("Failed to load the next catalog page", error);
        return Response.json(
            { error: "Не удалось загрузить товары. Попробуйте ещё раз." },
            { status: 500 },
        );
    }
}
