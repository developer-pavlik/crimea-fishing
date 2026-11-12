import styles from './SearchFilters.module.scss';

const SearchFilters = () => {
    return (
        <div className={styles.searchFilters}>
            <h2 className={styles.searchFiltersTitle}>Фильтры</h2>
            <div className={styles.searchFiltersContent}>
                <div className={styles.searchFiltersSection}>
                    <div className={styles.searchFiltersLabel}>Цена</div>
                    <div className={styles.searchFiltersItem}>
                        <div className={styles.searchFiltersPriceRange}>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchFilters;
