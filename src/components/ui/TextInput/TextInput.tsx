import React from 'react'
import type { BaseInputType } from '../BaseInput/BaseInput';
import BaseInput from '../BaseInput/BaseInput';
import FieldError from '../FieldError/FieldError';
import cn from "clsx";

export interface TextInputType extends BaseInputType {
    errorText?: string;
}

import styles from './TextInput.module.scss'

const TextInput: React.FC<TextInputType> = ({className, errorText, ...props }) => {
    const isError = !!errorText;

    return (
        <div className={cn(styles.field, className)}>
            <BaseInput isError={isError} {...props} />
            {isError &&  <FieldError text={errorText}/>} 
        </div>
    )
}

export default TextInput
