"use client";

import { type MouseEvent, type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import cn from "clsx";
import { Button } from "@/components/ui/Button/Button";
import MenuIcon from "../../../public/icons/category.svg";
import styles from "./ProductCategoriesMenu.module.scss";

type Props = {
    children: ReactNode;
};

const ProductCategoriesMenuToggle = ({ children }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuId = useId();
    const containerRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        if (!isOpen) return;

        const container = containerRef.current;
        if (!container) return;

        const getButton = () => container.querySelector<HTMLButtonElement>("button");
        const getLinks = () => Array.from(container.querySelectorAll<HTMLAnchorElement>("nav a"));

        // Фокус на первый пункт при открытии
        getLinks()[0]?.focus();

        // Число колонок сетки: элементы первой строки имеют одинаковый offsetTop
        const getColumns = (links: HTMLAnchorElement[]) => {
            const firstTop = links[0].offsetTop;
            const count = links.findIndex((link) => link.offsetTop !== firstTop);
            return count === -1 ? links.length : count;
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                getButton()?.focus();
                return;
            }

            const links = getLinks();
            const button = getButton();
            if (!button || links.length === 0) return;

            const active = document.activeElement;
            const index = links.findIndex((link) => link === active);

            // Focus trap: Tab циклически ходит по кнопке и пунктам меню
            if (event.key === "Tab") {
                const order: HTMLElement[] = [button, ...links];
                const current = order.findIndex((el) => el === active);
                const next = event.shiftKey
                    ? (current <= 0 ? order.length - 1 : current - 1)
                    : (current === -1 || current === order.length - 1 ? 0 : current + 1);
                event.preventDefault();
                order[next].focus();
                return;
            }

            const columns = getColumns(links);
            let target: number | null = null;

            switch (event.key) {
                case "ArrowRight":
                    target = index === -1 ? 0 : Math.min(index + 1, links.length - 1);
                    break;
                case "ArrowLeft":
                    target = index === -1 ? 0 : Math.max(index - 1, 0);
                    break;
                case "ArrowDown":
                    target = index === -1 ? 0 : index + columns < links.length ? index + columns : index;
                    break;
                case "ArrowUp":
                    target = index === -1 ? 0 : index - columns >= 0 ? index - columns : index;
                    break;
                case "Home":
                    target = 0;
                    break;
                case "End":
                    target = links.length - 1;
                    break;
            }

            if (target !== null) {
                event.preventDefault();
                links[target].focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
        if ((event.target as HTMLElement).closest("a")) {
            close();
        }
    };

    return (
        <div ref={containerRef} className={styles.productCategoriesMenu}>
            <Button
                className={styles.button}
                type="button"
                view="primary"
                aria-expanded={isOpen}
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={() => setIsOpen((value) => !value)}
            >
                <span>Каталог</span>
                <MenuIcon className={styles.menuIcon} aria-hidden="true" />
            </Button>

            <div id={menuId} className={cn(styles.dropdown, { [styles.dropdown_open]: isOpen })}>
                <div className={styles.backdrop} aria-hidden="true" onClick={close} />

                <nav className={styles.menu} aria-label="Категории товаров" onClick={handleMenuClick}>
                    {children}
                </nav>
            </div>
        </div>
    );
};

export default ProductCategoriesMenuToggle;
