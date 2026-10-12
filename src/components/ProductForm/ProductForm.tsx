'use client';

import { useState } from 'react';
import styles from './ProductForm.module.scss'
import TextInput from '../ui/TextInput/TextInput';
import Textarea from '../ui/Textarea/Textarea';
import { Button } from '../ui/Button/Button';
import ImgLoader from '../ImgLoader/ImgLoader';
import Checkbox from '../ui/Checkbox/Checkbox';
import Radio from '../ui/Radio/Radio';

import DeleteIcon from '../../../public/icons/delete.svg';

type ProductCondition = 'new' | 'used';

interface ProductData {
    title: string;
    price: number;
    condition: ProductCondition;
}

interface ProductFormProps {
    initialData?: ProductData;
    onSubmit?: (data: ProductData) => Promise<void>;
}

export default function ProductForm({ initialData, onSubmit = async () => {} }: ProductFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [price, setPrice] = useState(initialData?.price || 0);
    const [condition, setCondition] = useState<ProductCondition>(initialData?.condition || 'new');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit({ title, price, condition });
        setLoading(false);
    };

  return (
    <div className={styles.productFormWrapper}>
        <div className={styles.titleWrapper}>
            <h2 className={styles.title}>{initialData ? 'Редактирование товара' : 'Добавление товара'}</h2>
        </div>
        <form onSubmit={handleSubmit} className={styles.productForm}>
            <ImgLoader />
            <div className={styles.productFormField}>
                <TextInput name='title' className={styles.input} placeholder='Заголовок товара' />
            </div>
            <div className={styles.productPriceInfo}>
                <div className={styles.productFormField}>
                    <TextInput type='number' name='price' className={styles.input} placeholder='Цена в рублях' />
                </div>
                <div className={styles.productFormField}>
                    <Checkbox name="isFree" label="Отдам даром" />
                </div>
            </div>
            <div className={styles.productFormField}>
                <Textarea name='description'placeholder='Описание товара' />
            </div>

            <div className={styles.productCondition}>
                <span className={styles.productConditionLabel}>Состояние товара</span>
                <div className={styles.productConditionOptions}>
                    <Radio
                        name='condition'
                        value='new'
                        checked={condition === 'new'}
                        onChange={() => setCondition('new')}
                        label='Новое'
                    />
                    <Radio
                        name='condition'
                        value='used'
                        checked={condition === 'used'}
                        onChange={() => setCondition('used')}
                        label='Б/У'
                    />
                </div>
            </div>

            <div className={styles.productSpecifications}>
                <div className={styles.productSpecificationsLabel}>Спецификации товара</div>
                <div className={styles.productSpecificationsItems}>
                    <div className={styles.productSpecificationsItem}>
                        <TextInput name='specification-name' className={styles.input} placeholder='Название параметра' />
                        <TextInput name='specification-value' className={styles.input} placeholder='Значение параметра' />
                        <Button type="button" className={styles.productSpecificationsDeleleButton}>
                            <DeleteIcon className={styles.productSpecificationsDeleleIcon} />
                        </Button>
                    </div>
                </div>
                <div className={styles.productSpecificationsAddItems}>
                    <Button type="button">Добавить строку</Button>
                </div>
            </div>
            
            
            <div className={styles.productFormSubmitButton}>
                <Button type="submit" disabled={loading}>
                    {initialData ? 'Сохранить изменения' : 'Добавить товар'}
                </Button>
            </div>    
        </form>
    </div>
  );
}