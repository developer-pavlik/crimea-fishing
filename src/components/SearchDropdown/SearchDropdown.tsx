import styles from './SearchDropdown.module.scss'


const SearchDropdown = () => (
    <div className={styles.searchDropdown}>
        <div className={styles.searchDropdownMenu}>
            <ul className={styles.searchDropdownList}>
                <li className={styles.searchDropdownItem}>Option 1</li>
                <li className={styles.searchDropdownItem}>Option 2</li>
                <li className={styles.searchDropdownItem}>Option 3</li>
            </ul>
        </div>
        <div className={styles.searchDropdownBackdrop} />
    </div>
);

export default SearchDropdown