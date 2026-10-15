import type { ProductTileProps } from "@/components/ProductTile/ProductTile";

export interface ProductPage {
    items: ProductTileProps[];
    nextCursor: string | null;
    hasMore: boolean;
}
