import { getAccessSession } from "@/lib/auth";
import { getProductPage, InvalidProductCursorError } from "@/lib/products";

export async function GET(request: Request) {
    const session = await getAccessSession();

    if (!session) {
        return Response.json(
            { error: "Для просмотра своих товаров необходимо войти в аккаунт." },
            { status: 401 },
        );
    }

    const cursor = new URL(request.url).searchParams.get("cursor");

    try {
        const page = await getProductPage({
            cursor,
            viewerId: session.userId,
            sellerId: session.userId,
        });
        return Response.json(page);
    } catch (error) {
        if (error instanceof InvalidProductCursorError) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        console.error("Failed to load the next profile product page", error);
        return Response.json(
            { error: "Не удалось загрузить товары. Попробуйте ещё раз." },
            { status: 500 },
        );
    }
}
