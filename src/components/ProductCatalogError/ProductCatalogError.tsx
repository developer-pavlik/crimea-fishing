"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import styles from "./ProductCatalogError.module.scss";

export default function ProductCatalogError() {
    const router = useRouter();

    return (
        <section className={styles.error} role="alert">
            <h1 className={styles.title}>Не удалось загрузить товары</h1>
            <p className={styles.description}>
                Попробуйте загрузить каталог ещё раз.
            </p>
            <Button onClick={() => router.refresh()}>Повторить</Button>
        </section>
    );
}
