import React, { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Checkbox.module.scss'
import cn from "clsx";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...props }) => {
    const id = useId();

    return (
        <div className={cn(styles.container, className)}>
            <div className={styles.checkboxWrapper}>
                <input id={id} className={styles.input}  type="checkbox" {...props} />
                <span className={styles.checkbox}>
                    <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.33325 7.94467L6.48259 11L12.6666 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </div>

            {label && <label className={styles.label} htmlFor={id}>{label}</label>}
        </div>
    )  
};

export default Checkbox;
