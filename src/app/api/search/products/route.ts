import { getAccessSession } from "@/lib/auth";
import { InvalidProductCursorError } from "@/lib/products";
import {
    getSearchProductPage,
    normalizeSearchQuery,
    parseSearchSort,
} from "@/lib/search";

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const query = normalizeSearchQuery(searchParams.get("q"));

    if (!query) {
        return Response.json(
            { error: "Введите поисковый запрос." },
            { status: 400 },
        );
    }

    const session = await getAccessSession();

    try {
        const page = await getSearchProductPage({
            query,
            sort: parseSearchSort(searchParams.get("sort")),
            cursor: searchParams.get("cursor"),
            viewerId: session?.userId,
        });
        return Response.json(page);
    } catch (error) {
        if (error instanceof InvalidProductCursorError) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        console.error("Failed to load the next search page", error);
        return Response.json(
            { error: "Не удалось загрузить товары. Попробуйте ещё раз." },
            { status: 500 },
        );
    }
}
