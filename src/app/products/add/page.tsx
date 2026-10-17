import { redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm/ProductForm";
import { createProduct } from "@/actions/products";
import { getAccessSession } from "@/lib/auth";

export const metadata = {
  title: "Добавить объявление о продаже снастей | Рыбацкая барахолка",
};

export default async function AddProductPage() {
  const session = await getAccessSession();
  if (!session) redirect("/login");

  async function handleSubmit(data: Parameters<typeof createProduct>[0]) {
    "use server";
    const result = await createProduct(data);
    if (result.success) redirect(`/product/${result.id}`);
    throw new Error(result.error === "unauthorized" ? "Требуется авторизация" : "Не удалось сохранить товар");
  }

  return <ProductForm onSubmit={handleSubmit} />;
}
