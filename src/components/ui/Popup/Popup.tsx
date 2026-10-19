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

export interface PopupClassNames {
    popup?: string;
    backdrop?: string;
    header?: string;
    title?: string;
    content?: string;
    closeButton?: string;
}

export interface PopupProps
    extends Omit<DialogProps, "children" | "className" | "title"> {
    children?: ReactNode;
    title?: ReactNode;
    className?: string;
    classNames?: PopupClassNames;
    closeButtonLabel?: string;
}

export const Popup = ({
    children,
    title,
    className,
    classNames,
    closeButtonLabel = "Закрыть",
    backdrop,
    ...dialogProps
}: PopupProps) => {
    return (
        <Dialog
            {...dialogProps}
            modal
            backdrop={
                backdrop ?? (
                    <div className={cn(styles.backdrop, classNames?.backdrop)} />
                )
            }
            className={cn(styles.popup, className, classNames?.popup)}
        >
            <div className={cn(styles.header, classNames?.header)}>
                {title && (
                    <DialogHeading className={cn(styles.title, classNames?.title)}>
                        {title}
                    </DialogHeading>
                )}
                <DialogDismiss
                    className={cn(styles.closeButton, classNames?.closeButton)}
                    aria-label={closeButtonLabel}
                >
                    <span aria-hidden="true">×</span>
                </DialogDismiss>
            </div>
            <div className={cn(styles.content, classNames?.content)}>{children}</div>
        </Dialog>
    );
};

Popup.displayName = "Popup";

export default Popup;
