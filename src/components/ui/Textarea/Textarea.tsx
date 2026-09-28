import React from 'react';
import styles from './Textarea.module.scss'
import cn from "clsx";
import FieldError from '../FieldError/FieldError';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  errorText?: string;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, errorText, className, ...props }) => {
    const isError = !!errorText;

    return (
        <div className={cn(styles.textareaField, className)}>
            {label && <label>{label}</label>}
            <textarea className={cn(styles.textarea,  {[styles.textarea_error]: isError})} {...props} />
            {isError &&  <FieldError text={errorText}/>} 
        </div>
    );
};

export default Textarea;
