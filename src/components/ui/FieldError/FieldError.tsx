import styles from './FieldError.module.scss';
import cn from "clsx";

interface FieldErrorProps {
    text: string,
    className?: string,
}

const FieldError : React.FC<FieldErrorProps> = ({text, className}) => {
    return (
        <div className={cn(styles.fieldError, className)}>{text}</div>
    )
}

export default FieldError