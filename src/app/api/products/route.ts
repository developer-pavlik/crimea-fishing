import { getAccessSession } from "@/lib/auth";
import {
    getProductPage,
    InvalidProductCursorError,
} from "@/lib/products";

export async function GET(request: Request) {
    const cursor = new URL(request.url).searchParams.get("cursor");
    const session = await getAccessSession();

    try {
        const page = await getProductPage(cursor, session?.userId);
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
