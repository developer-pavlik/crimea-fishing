import { NextResponse, type NextRequest } from "next/server";
import { getSearchSuggestions, normalizeSearchQuery } from "@/lib/search";

export async function GET(request: NextRequest) {
    const query = normalizeSearchQuery(request.nextUrl.searchParams.get("q"));

    if (query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const suggestions = await getSearchSuggestions(query);

        return NextResponse.json(
            { suggestions },
            { headers: { "Cache-Control": "private, max-age=30" } },
        );
    } catch {
        return NextResponse.json(
            { error: "Не удалось получить подсказки." },
            { status: 500 },
        );
    }
}
