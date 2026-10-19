import cn from "clsx";
import type { ProductCondition } from "@/types/product-form";
import styles from "./ProductConditionLabel.module.scss";

interface ProductConditionLabelProps {
    condition: ProductCondition;
    className?: string;
}

const ProductConditionLabel = ({
    condition,
    className,
}: ProductConditionLabelProps) => {
    const isNew = condition === "new";

    return (
        <span
            className={cn(
                styles.conditionLabel,
                isNew ? styles.new : styles.used,
                className,
            )}
        >
            {isNew ? "Новый" : "Б/У"}
        </span>
    );
};

export default ProductConditionLabel;
