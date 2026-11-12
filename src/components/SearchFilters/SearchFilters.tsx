'use client';

import { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import TextInput from '@/components/ui/TextInput/TextInput';
import FieldError from '@/components/ui/FieldError/FieldError';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Radio from '@/components/ui/Radio/Radio';
import { Button } from '@/components/ui/Button/Button';
import {
    EMPTY_SEARCH_FILTERS,
    setSearchFilterParams,
    type SearchConditionFilter,
    type SearchFilters,
} from '@/lib/search-filters';
import styles from './SearchFilters.module.scss';
import cn from "clsx";

const PRICE_DEBOUNCE_MS = 500;

interface SearchFiltersForm {
    priceFrom: string;
    priceTo: string;
    onlyFree: boolean;
    condition: SearchConditionFilter;
    onlyWithPhoto: boolean;
}

const CONDITION_OPTIONS: { value: SearchConditionFilter; label: string }[] = [
    { value: 'any', label: 'Любое' },
    { value: 'new', label: 'Новый' },
    { value: 'used', label: 'Б/у' },
];

const validatePrice = (value: string) => {
    if (value === '') return true;
    const n = Number(value);
    if (!Number.isSafeInteger(n)) return 'Введите целое число';
    if (n < 0) return 'Цена не может быть отрицательной';
    return true;
};

const toFormValues = (filters: SearchFilters): SearchFiltersForm => ({
    priceFrom: filters.priceFrom === null ? '' : String(filters.priceFrom),
    priceTo: filters.priceTo === null ? '' : String(filters.priceTo),
    onlyFree: filters.onlyFree,
    condition: filters.condition,
    onlyWithPhoto: filters.onlyWithPhoto,
});

// Возвращает null, если цены в форме невалидны.
const toFilters = (values: SearchFiltersForm): SearchFilters | null => {
    const parse = (value: string) => {
        if (value === '') return null;
        return validatePrice(value) === true ? Number(value) : NaN;
    };
    const priceFrom = values.onlyFree ? null : parse(values.priceFrom);
    const priceTo = values.onlyFree ? null : parse(values.priceTo);

    if (Number.isNaN(priceFrom) || Number.isNaN(priceTo)) return null;
    if (priceFrom !== null && priceTo !== null && priceFrom > priceTo) return null;

    return {
        priceFrom,
        priceTo,
        onlyFree: values.onlyFree,
        condition: values.condition,
        onlyWithPhoto: values.onlyWithPhoto,
    };
};

const serialize = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    setSearchFilterParams(params, filters);
    params.sort();
    return params.toString();
};

interface SearchFiltersProps {
    filters: SearchFilters;
    onChange: (filters: SearchFilters) => void;
}

const SearchFilters = ({ filters, onChange }: SearchFiltersProps) => {
    const {
        register,
        control,
        setValue,
        getValues,
        trigger,
        clearErrors,
        reset,
        formState: { errors },
    } = useForm<SearchFiltersForm>({
        mode: 'onChange',
        defaultValues: toFormValues(filters),
    });

    const values = useWatch({ control });
    const { onlyFree, priceFrom, priceTo, condition, onlyWithPhoto } = values;
    const priceError = errors.priceFrom?.message ?? errors.priceTo?.message;
    const propKey = serialize(filters);
    const lastSent = useRef(filters);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    // Синхронизация формы с URL при внешнем изменении (кнопки «Назад»/«Вперёд»).
    useEffect(() => {
        if (propKey === serialize(lastSent.current)) return;
        lastSent.current = filters;
        reset(toFormValues(filters));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propKey, reset]);

    // Применение фильтров: сразу для флагов, с задержкой для цен.
    useEffect(() => {
        const next = toFilters({
            priceFrom: priceFrom ?? '',
            priceTo: priceTo ?? '',
            onlyFree: onlyFree ?? false,
            condition: condition ?? 'any',
            onlyWithPhoto: onlyWithPhoto ?? false,
        });
        if (!next) return;

        const prev = lastSent.current;
        if (serialize(next) === serialize(prev)) return;

        const priceChanged =
            next.priceFrom !== prev.priceFrom || next.priceTo !== prev.priceTo;
        const timer = setTimeout(
            () => {
                lastSent.current = next;
                onChangeRef.current(next);
            },
            priceChanged ? PRICE_DEBOUNCE_MS : 0,
        );

        return () => clearTimeout(timer);
    }, [priceFrom, priceTo, onlyFree, condition, onlyWithPhoto]);

    const handleReset = () => {
        reset(toFormValues(EMPTY_SEARCH_FILTERS));
        clearErrors();
        lastSent.current = EMPTY_SEARCH_FILTERS;
        onChange(EMPTY_SEARCH_FILTERS);
    };

    const showReset =
        !!priceFrom ||
        !!priceTo ||
        !!onlyFree ||
        condition !== 'any' ||
        !!onlyWithPhoto;

    const validateRange = () => {
        const { priceFrom, priceTo } = getValues();
        if (priceFrom !== '' && priceTo !== '' && Number(priceFrom) > Number(priceTo)) {
            return '«От» не может быть больше «До»';
        }
        return true;
    };

    const revalidateRange = () => {
        void trigger(['priceFrom', 'priceTo']);
    };

    const handleOnlyFreeChange = (checked: boolean) => {
        setValue('onlyFree', checked);
        if (checked) {
            setValue('priceFrom', '');
            setValue('priceTo', '');
            clearErrors(['priceFrom', 'priceTo']);
        }
    };

    return (
        <form className={styles.searchFilters} onSubmit={(e) => e.preventDefault()} noValidate>
            <h2 className={styles.searchFiltersTitle}>Фильтры</h2>
            <div className={styles.searchFiltersContent}>
                <div className={styles.searchFiltersSection}>
                    <div className={styles.searchFiltersLabel}>Цена</div>
                    <div className={cn(styles.searchFiltersItem, styles.searchFiltersItem_price)}>
                        <div className={styles.searchFiltersPriceRange}>
                            <TextInput
                                className={styles.searchFiltersPriceInput}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                placeholder="От"
                                aria-label="Цена от"
                                disabled={onlyFree}
                                isError={!!errors.priceFrom}
                                {...register('priceFrom', {
                                    validate: validatePrice,
                                    onChange: revalidateRange,
                                })}
                            />
                            <span className={styles.searchFiltersPriceDash}>—</span>
                            <TextInput
                                className={styles.searchFiltersPriceInput}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                placeholder="До"
                                aria-label="Цена до"
                                disabled={onlyFree}
                                isError={!!errors.priceTo}
                                {...register('priceTo', {
                                    validate: { price: validatePrice, range: validateRange },
                                    onChange: revalidateRange,
                                })}
                            />
                        </div>
                        {priceError && <FieldError text={priceError} />}
                        <Checkbox
                            label="Только халява"
                            checked={onlyFree}
                            onChange={(e) => handleOnlyFreeChange(e.target.checked)}
                        />
                    </div>
                </div>
                <div className={styles.searchFiltersSection}>
                    <div className={styles.searchFiltersLabel}>Состояние</div>
                    <div className={cn(styles.searchFiltersItem, styles.searchFiltersItem_condition)}>
                        {CONDITION_OPTIONS.map((option) => (
                            <Radio
                                key={option.value}
                                label={option.label}
                                value={option.value}
                                {...register('condition')}
                            />
                        ))}
                    </div>
                </div>
                <div className={styles.searchFiltersSection}>
                    <div className={styles.searchFiltersLabel}>Наличие фото</div>
                    <div className={cn(styles.searchFiltersItem)}>
                        <Checkbox label="Только с фото" {...register('onlyWithPhoto')} />
                    </div>
                </div>
            </div>
            {showReset && (
                <Button view="secondary" onClick={handleReset}>
                    Сбросить фильтры
                </Button>
            )}
        </form>
    );
}

export default SearchFilters;
