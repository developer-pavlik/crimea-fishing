import styles from './SearchInput.module.scss'
import TextInput from '../TextInput/TextInput';
import { Button } from '../Button/Button';

const SearchInput = () => (
    <div className={styles.searchField}>
        <TextInput placeholder='Поиск товара' />
        <Button>Поиск</Button>
    </div>
);

export default SearchInput