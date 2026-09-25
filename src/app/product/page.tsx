import Product from "@/components/Product/Product";
import { productData } from "./data";

export const metadata = {
    title: "Товар",
};

export default function ProductPage() {
    return (
        <Product {...productData} />
    );
}


