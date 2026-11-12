"use client";

import {
    Select as AriaSelect,
    SelectArrow,
    SelectItem,
    SelectPopover,
    SelectProvider,
    useSelectContext,
} from "@ariakit/react";
import cn from "clsx";
import { useId } from "react";
import FieldError from "../FieldError/FieldError";
import styles from "./Select.module.scss";

export interface SelectOption<T extends string = string> {
    value: T;
    label: React.ReactNode;
    disabled?: boolean;
}

export interface SelectClassNames {
    field?: string;
    label?: string;
    select?: string;
    selectError?: string;
    value?: string;
    placeholder?: string;
    arrow?: string;
    popover?: string;
    item?: string;
    itemLabel?: string;
    check?: string;
}

export interface SelectProps<T extends string = string> {
    options: SelectOption<T>[];
    label?: React.ReactNode;
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
    placeholder?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    errorText?: string;
    className?: string;
    classNames?: SelectClassNames;
    "aria-label"?: string;
}

function Select<T extends string = string>({
    options,
    label,
    value,
    defaultValue,
    onChange,
    placeholder = "Выберите...",
    name,
    id,
    disabled,
    errorText,
    className,
    classNames,
    "aria-label": ariaLabel,
}: SelectProps<T>) {
    const autoId = useId();
    const isError = !!errorText;

    return (
        <div className={cn(styles.field, className, classNames?.field)}>
            <SelectProvider
                value={value}
                defaultValue={defaultValue}
                setValue={(v) => {
                    if (typeof v === "string") onChange?.(v as T);
                }}
            >
                {label && (
                    <label
                        htmlFor={id ?? autoId}
                        className={cn(styles.label, classNames?.label)}
                    >
                        {label}
                    </label>
                )}
                <AriaSelect
                    id={id ?? autoId}
                    name={name}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    aria-invalid={isError || undefined}
                    className={cn(
                        styles.select,
                        classNames?.select,
                        isError && [styles.select_error, classNames?.selectError],
                    )}
                    render={<button type="button" />}
                >
                    <SelectValueText
                        options={options}
                        placeholder={placeholder}
                        classNames={classNames}
                    />
                    <SelectArrow className={cn(styles.arrow, classNames?.arrow)} />
                </AriaSelect>
                <SelectPopover
                    gutter={4}
                    sameWidth
                    portal
                    className={cn(styles.popover, classNames?.popover)}
                >
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className={cn(styles.item, classNames?.item)}
                        >
                            <span className={cn(styles.itemLabel, classNames?.itemLabel)}>
                                {option.label}
                            </span>
                        </SelectItem>
                    ))}
                </SelectPopover>
            </SelectProvider>
            {isError && <FieldError text={errorText} />}
        </div>
    );
}

function SelectValueText<T extends string>({
    options,
    placeholder,
    classNames,
}: {
    options: SelectOption<T>[];
    placeholder: string;
    classNames?: SelectClassNames;
}) {
    const store = useSelectContext();
    const current = store?.useState("value");
    const selected = options.find((o) => o.value === current);

    return (
        <span
            className={cn(
                styles.value,
                classNames?.value,
                !selected && [styles.placeholder, classNames?.placeholder],
            )}
        >
            {selected ? selected.label : placeholder}
        </span>
    );
}

export default Select;
