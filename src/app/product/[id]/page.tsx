import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Product from "@/components/Product/Product";
import { getAccessSession } from "@/lib/auth";
import {
    getProductById,
    ProductDetailsQueryError,
} from "@/lib/products";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

async function loadProduct(id: string) {
    const session = await getAccessSession();
    return getProductById(id, session?.userId);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { id } = await params;

    try {
        const product = await loadProduct(id);

        return {
            title: product?.title ?? "Товар",
        };
    } catch {
        return { title: "Товар" };
    }
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const session = await getAccessSession();
    let product;

    try {
        product = await getProductById(id, session?.userId);
    } catch (error) {
        if (error instanceof ProductDetailsQueryError) {
            console.error("Failed to load product page", error.cause);
        }

        throw error;
    }

    if (!product) {
        notFound();
    }

    return (
        <Product
            id={product.id}
            title={product.title}
            price={product.price}
            imagesUrl={product.imagesUrl}
            description={product.description}
            specifications={product.specifications}
            inFavorites={product.isFavorite}
            isAuthenticated={Boolean(session)}
            canManage={product.canManage}
            author={product.author}
        />
    );
}
