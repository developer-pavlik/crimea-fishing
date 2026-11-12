import Select from '@/components/ui/Select/Select';
import styles from './SearchResults.module.scss';

const SORT_OPTIONS = [
    { value: 'default', label: 'По умолчанию' },
    { value: 'price_asc', label: 'Сначала недорогие' },
    { value: 'price_desc', label: 'Сначала дорогие' },
];

const soetSelectClassNames = {
    field: styles.sortSelectField,
    select: styles.sortSelect,
}

const SearchResults = () => {
    return (
        <div className={styles.searchResults}>
            <div className={styles.sidebar}>Тут будут фильтры</div>
            <div className={styles.content}>
                <Select
                    label="Сортировка"
                    options={SORT_OPTIONS}
                    classNames={soetSelectClassNames}
                    defaultValue="default"
                />
                Основной контент
            </div>
        </div>
    );
};

export default SearchResults;
