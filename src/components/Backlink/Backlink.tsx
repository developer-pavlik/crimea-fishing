"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import PrevIcon from "../../../public/icons/prev.svg";
import styles from "./Backlink.module.scss";

export default function Backlink() {
    const router = useRouter();

    return (
        <Button
            view="secondary"
            className={styles.backlink}
            onClick={() => router.back()}
        >
            <PrevIcon className={styles.icon} aria-hidden="true" />
            <span className={styles.text}>Назад</span>
        </Button>
    );
}
