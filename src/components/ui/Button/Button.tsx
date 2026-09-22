"use client";

import { type ButtonHTMLAttributes } from "react";
import cn from "clsx";
import styles from "./Button.module.scss";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: "s" | "m" | "l";
    view?: "primary" | "secondary";
    isLoading?: boolean;
    isDisabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    view = "primary", 
    size = "s",
    isLoading = false,
    isDisabled = false,
    className, children,
    disabled,
    ...props
}) => {
    const isDisabledButton = disabled || isDisabled || isLoading;

    return (
        <button
                {...props}
                type={props.type ?? "button"}
                disabled={isDisabledButton}
                aria-busy={isLoading}
                className={cn(
                    styles.button,
                    styles[`button_size-${size}`],
                    styles[`button_${view}`],
                    {
                        [styles.button_loading]: isLoading,
                        [styles.button_disabled]: isDisabledButton,
                    },
                    className,
                )}
            >
                {isLoading && <span className={styles.loader} aria-hidden="true" />}
                <span className={styles.content}>{children}</span>
        </button>
    )
}