import React, { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Switch.module.scss'
import cn from "clsx";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
}

const Switch: React.FC<SwitchProps> = ({ label, className, ...props }) => {
    const id = useId();

    return (
        <div className={cn(styles.container, className)}>
            <div className={styles.switchWrapper}>
                <input id={id} className={styles.input} type="checkbox" role="switch" {...props} />
                <span className={styles.track}>
                    <span className={styles.thumb} />
                </span>
            </div>

            {label && <label className={styles.label} htmlFor={id}>{label}</label>}
        </div>
    )
};

export default Switch;
