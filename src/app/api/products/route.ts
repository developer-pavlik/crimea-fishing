import { getAccessSession } from "@/lib/auth";
import {
    getProductPage,
    isProductCategory,
    InvalidProductCursorError,
} from "@/lib/products";

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const cursor = searchParams.get("cursor");
    const categoryValue = searchParams.get("category");

    if (categoryValue !== null && !isProductCategory(categoryValue)) {
        return Response.json(
            { error: "Некорректная категория товаров." },
            { status: 400 },
        );
    }

    const session = await getAccessSession();

    try {
        const page = await getProductPage(
            cursor,
            session?.userId,
            categoryValue ?? undefined,
        );
        return Response.json(page);
    } catch (error) {
        if (error instanceof InvalidProductCursorError) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        console.error("Failed to load the next product page", error);
        return Response.json(
            { error: "Не удалось загрузить товары. Попробуйте ещё раз." },
            { status: 500 },
        );
    }
}
