import React, { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import cn from 'clsx';
import styles from './Radio.module.scss'

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Radio: React.FC<RadioProps> = ({ label, className, ...props }) => {
    const id = useId();

    return (
        <div className={cn(styles.container, className)}>
            <div className={styles.radioWrapper}>
                <input id={id} className={styles.input} type="radio" {...props} />
                <span className={styles.radio}>
                    <span className={styles.dot} />
                </span>
            </div>

            {label && <label className={styles.label} htmlFor={id}>{label}</label>}
        </div>
    )
};

export default Radio;
