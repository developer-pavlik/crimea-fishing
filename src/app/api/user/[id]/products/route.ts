import { getAccessSession } from "@/lib/auth";
import {
    getProductPage,
    InvalidProductCursorError,
} from "@/lib/products";
import { isUserId } from "@/lib/users";

type UserProductsRouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    request: Request,
    { params }: UserProductsRouteContext,
) {
    const { id } = await params;

    if (!isUserId(id)) {
        return Response.json({ error: "Пользователь не найден." }, { status: 404 });
    }

    const cursor = new URL(request.url).searchParams.get("cursor");
    const session = await getAccessSession();

    try {
        const page = await getProductPage({
            cursor,
            viewerId: session?.userId,
            sellerId: id,
        });

        return Response.json(page);
    } catch (error) {
        if (error instanceof InvalidProductCursorError) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        console.error("Failed to load the next user product page", error);
        return Response.json(
            { error: "Не удалось загрузить товары. Попробуйте ещё раз." },
            { status: 500 },
        );
    }
}
