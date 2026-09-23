import styles from './SearchInput.module.scss'
import TextInput from '../TextInput/TextInput';
import { Button } from '../Button/Button';
import SearchIcon from '../../../../public/icons/search.svg';

const SearchInput = () => (
    <div className={styles.searchField}>
        <TextInput name='search' className={styles.searchInput} placeholder='Поиск товара' />
        <Button className={styles.searchButton} type='submit'>
            <SearchIcon className={styles.searchIcon} />
        </Button>
    </div>
);

export default SearchInput