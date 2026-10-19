"use client";

import {
    Dialog,
    DialogDismiss,
    DialogHeading,
    type DialogProps,
} from "@ariakit/react";
import cn from "clsx";
import type { ReactNode } from "react";
import styles from "./Popup.module.scss";

export interface PopupProps
    extends Omit<DialogProps, "children" | "className" | "title"> {
    children?: ReactNode;
    title?: ReactNode;
    className?: string;
    closeButtonLabel?: string;
}

export const Popup = ({
    children,
    title,
    className,
    closeButtonLabel = "Закрыть",
    backdrop,
    ...dialogProps
}: PopupProps) => {
    return (
        <Dialog
            {...dialogProps}
            modal
            backdrop={backdrop ?? <div className={styles.backdrop} />}
            className={cn(styles.popup, className)}
        >
            <div className={styles.header}>
                {title && <DialogHeading className={styles.title}>{title}</DialogHeading>}
                <DialogDismiss
                    className={styles.closeButton}
                    aria-label={closeButtonLabel}
                >
                    <span aria-hidden="true">×</span>
                </DialogDismiss>
            </div>
            <div className={styles.content}>{children}</div>
        </Dialog>
    );
};

Popup.displayName = "Popup";

export default Popup;
