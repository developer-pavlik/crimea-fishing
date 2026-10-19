"use client";

import type { ReactNode } from "react";
import cn from "clsx";
import Popup, { type PopupProps } from "@/components/ui/Popup/Popup";
import { Button } from "@/components/ui/Button/Button";
import styles from "./PopupConfirmDeleteProduct.module.scss";

export interface PopupConfirmDeleteProductProps
    extends Omit<PopupProps, "children" | "title" | "open" | "onClose"> {
    open: boolean;
    setOpen: (open: boolean) => void;
    productTitle: string;
    onConfirm: () => void;
    isLoading?: boolean;
    error?: ReactNode;
}

export const PopupConfirmDeleteProduct = ({
    open,
    setOpen,
    productTitle,
    onConfirm,
    isLoading = false,
    error,
    className,
    classNames,
    ...popupProps
}: PopupConfirmDeleteProductProps) => {
    const handleClose = () => {
        if (!isLoading) {
            setOpen(false);
        }
    };

    return (
        <Popup
            {...popupProps}
            open={open}
            onClose={handleClose}
            title="Удалить товар?"
            className={cn(styles.popup, className)}
            classNames={classNames}
        >
            <p className={styles.message}>
                Вы действительно хотите удалить товар «<strong className={styles.productTitle}>{productTitle}</strong>»?
            </p>
            <p className={styles.warning}>Это действие нельзя будет отменить.</p>
            {error && (
                <div className={styles.error} role="alert">
                    {error}
                </div>
            )}
            <div className={styles.actions}>
                <Button
                    type="button"
                    view="secondary"
                    isDisabled={isLoading}
                    onClick={handleClose}
                >
                    Отмена
                </Button>
                <Button
                    type="button"
                    view="negative"
                    isLoading={isLoading}
                    onClick={onConfirm}
                >
                    Удалить
                </Button>
            </div>
        </Popup>
    );
};

PopupConfirmDeleteProduct.displayName = "PopupConfirmDeleteProduct";

export default PopupConfirmDeleteProduct;
