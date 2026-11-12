'use client';

import { useForm, useWatch } from 'react-hook-form';
import TextInput from '@/components/ui/TextInput/TextInput';
import FieldError from '@/components/ui/FieldError/FieldError';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import styles from './SearchFilters.module.scss';
import cn from "clsx";

interface SearchFiltersForm {
    priceFrom: string;
    priceTo: string;
    onlyFree: boolean;
    conditionNew: boolean;
    conditionUsed: boolean;
    onlyWithPhoto: boolean;
}

const validatePrice = (value: string) => {
    if (value === '') return true;
    const n = Number(value);
    if (!Number.isSafeInteger(n)) return 'Введите целое число';
    if (n < 0) return 'Цена не может быть отрицательной';
    return true;
};

const SearchFilters = () => {
    const {
        register,
        control,
        setValue,
        getValues,
        trigger,
        clearErrors,
        formState: { errors },
    } = useForm<SearchFiltersForm>({
        mode: 'onChange',
        defaultValues: { priceFrom: '', priceTo: '', onlyFree: false, conditionNew: false, conditionUsed: false, onlyWithPhoto: false },
    });

    const onlyFree = useWatch({ control, name: 'onlyFree' });
    const priceError = errors.priceFrom?.message ?? errors.priceTo?.message;

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
                        <Checkbox label="Новый" {...register('conditionNew')} />
                        <Checkbox label="Б/у" {...register('conditionUsed')} />
                    </div>
                </div>
                <div className={styles.searchFiltersSection}>
                    <div className={styles.searchFiltersLabel}>Наличие фото</div>
                    <div className={cn(styles.searchFiltersItem)}>
                        <Checkbox label="Только с фото" {...register('onlyWithPhoto')} />
                    </div>
                </div>
            </div>
        </form>
    );
}

export default SearchFilters;
