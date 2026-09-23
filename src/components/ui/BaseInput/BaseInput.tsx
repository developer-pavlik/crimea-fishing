import React from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './BaseInput.module.scss'
import cn from "clsx";

export interface BaseInputType extends InputHTMLAttributes<HTMLInputElement> {
    inputSize?: 's' | 'm' | 'l';
    view?: 'primary' | 'secondary';
    isError?: boolean;
}

const BaseInput: React.FC<BaseInputType> = ({ type = 'text', view = 'primary', inputSize = "s", className, isError,  ...props }) => {
    return (
        <input className={cn(styles.input, 
            {[styles[`input_size-${inputSize}`] ?? '']: inputSize},
            {[styles[`input_${view}`] ?? '']: view},
            {[styles.input_error]: isError},
            className)}
            type={type} 
            {...props} 
            />
    )
}

export default BaseInput
