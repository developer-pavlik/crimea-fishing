import cn from 'clsx';
import styles from './SearchDropdown.module.scss'

export interface SearchDropdownItem {
    value: string;
    removable?: boolean;
}

interface SearchDropdownProps {
    id: string;
    items: SearchDropdownItem[];
    activeIndex: number;
    onSelect: (value: string) => void;
    onRemove: (value: string) => void;
    onClose: () => void;
}

const SearchDropdown = ({ id, items, activeIndex, onSelect, onRemove, onClose }: SearchDropdownProps) => (
    <div className={styles.searchDropdown}>
        <div className={styles.searchDropdownMenu}>
            <ul className={styles.searchDropdownList} id={id} role="listbox">
                {items.map((item, index) => (
                    <li
                        key={item.value}
                        id={`${id}-${index}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        className={cn(styles.searchDropdownItem, {
                            [styles.searchDropdownItem_active]: index === activeIndex,
                        })}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onSelect(item.value)}
                    >
                        <span className={styles.searchDropdownText}>{item.value}</span>
                        {item.removable && (
                            <button
                                type="button"
                                className={styles.searchDropdownRemove}
                                aria-label={`Удалить «${item.value}» из истории`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(item.value);
                                }}
                            >
                                ×
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
        <div className={styles.searchDropdownBackdrop} onClick={onClose} />
    </div>
);

export default SearchDropdown
