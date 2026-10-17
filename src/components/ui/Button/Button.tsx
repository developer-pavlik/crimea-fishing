"use client";

import Link, { type LinkProps } from "next/link";
import {
    type AnchorHTMLAttributes,
    type ButtonHTMLAttributes,
    type MouseEvent,
    type ReactNode,
} from "react";
import cn from "clsx";
import styles from "./Button.module.scss";

type ButtonCommonProps = {
    size?: "s" | "m" | "l";
    view?: "primary" | "secondary" | "negative" | "positive";
    isLoading?: boolean;
    isDisabled?: boolean;
    children?: ReactNode;
};

type ButtonElementProps = ButtonCommonProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
        asLink?: false;
        href?: never;
    };

type LinkElementProps = ButtonCommonProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> &
    Omit<LinkProps, "href"> & {
        asLink: true;
        href: LinkProps["href"];
        onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
    };

export type ButtonProps = ButtonElementProps | LinkElementProps;

export const Button = (props: ButtonProps) => {
    if (props.asLink) {
        const {
            view = "primary",
            size = "s",
            isLoading = false,
            isDisabled = false,
            className,
            children,
            asLink,
            href,
            onClick,
            ...linkProps
        } = props;
        void asLink;
        const isDisabledLink = isDisabled || isLoading;
        const classNames = cn(
            styles.button,
            styles[`button_size-${size}`],
            styles[`button_${view}`],
            {
                [styles.button_loading]: isLoading,
                [styles.button_disabled]: isDisabledLink,
            },
            className,
        );
        const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
            if (isDisabledLink) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            onClick?.(event);
        };

        return (
            <Link
                {...linkProps}
                href={href}
                onClick={handleClick}
                aria-busy={isLoading}
                aria-disabled={isDisabledLink || undefined}
                className={classNames}
            >
                {isLoading && <span className={styles.loader} aria-hidden="true" />}
                <span className={styles.content}>{children}</span>
            </Link>
        );
    }

    const {
        view = "primary",
        size = "s",
        isLoading = false,
        isDisabled = false,
        className,
        children,
        asLink,
        disabled,
        ...buttonProps
    } = props;
    void asLink;
    const isDisabledButton = disabled || isDisabled || isLoading;
    const classNames = cn(
        styles.button,
        styles[`button_size-${size}`],
        styles[`button_${view}`],
        {
            [styles.button_loading]: isLoading,
            [styles.button_disabled]: isDisabledButton,
        },
        className,
    );

    return (
        <button
            {...buttonProps}
            type={buttonProps.type ?? "button"}
            disabled={isDisabledButton}
            aria-busy={isLoading}
            className={classNames}
        >
            {isLoading && <span className={styles.loader} aria-hidden="true" />}
            <span className={styles.content}>{children}</span>
        </button>
    );
};

Button.displayName = "Button";
