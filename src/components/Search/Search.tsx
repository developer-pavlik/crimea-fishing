import styles from './Search.module.scss'
import SearchInput from '../ui/SearchInput/SearchInput';
import SearchDropdown from '../SearchDropdown/SearchDropdown';


const Search = () => (
    <div className={styles.search}>
        <SearchInput />
        {/* <SearchDropdown /> */}
    </div>
);

export default Search
