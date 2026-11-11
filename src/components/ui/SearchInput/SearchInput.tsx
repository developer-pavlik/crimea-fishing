import type { InputHTMLAttributes } from 'react';
import styles from './SearchInput.module.scss'
import TextInput from '../TextInput/TextInput';
import { Button } from '../Button/Button';
import SearchIcon from '../../../../public/icons/search.svg';

const SearchInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
    <div className={styles.searchField}>
        <TextInput
            name='q'
            className={styles.searchInput}
            placeholder='Поиск товара'
            autoComplete='off'
            maxLength={100}
            {...props}
        />
        <Button className={styles.searchButton} type='submit' aria-label='Найти'>
            <SearchIcon className={styles.searchIcon} />
        </Button>
    </div>
);

export default SearchInput
