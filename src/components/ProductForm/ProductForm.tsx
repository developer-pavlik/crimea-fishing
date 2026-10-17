'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import styles from './ProductForm.module.scss';
import TextInput from '../ui/TextInput/TextInput';
import Textarea from '../ui/Textarea/Textarea';
import { Button } from '../ui/Button/Button';
import ImgLoader from '../ImgLoader/ImgLoader';
import Checkbox from '../ui/Checkbox/Checkbox';
import Radio from '../ui/Radio/Radio';
import DeleteIcon from '../../../public/icons/delete.svg';
import type { ProductFormData, ProductInitialData } from '@/types/product-form';

const emptySpecification = { name: '', value: '' };

interface ProductFormProps {
  initialData?: ProductInitialData;
  onSubmit?: (data: ProductFormData) => Promise<void>;
}

function getErrorMessage(error: unknown) {
  return error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
    ? error.message
    : undefined;
}

export default function ProductForm({ initialData, onSubmit = async () => {} }: ProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      title: initialData?.title ?? '',
      price: initialData?.price ?? 0,
      isFree: (initialData?.price ?? 0) === 0,
      condition: initialData?.condition ?? 'new',
      description: initialData?.description ?? '',
      imagesUrl: initialData?.imagesUrl ?? [],
      specifications: initialData?.specifications?.length ? initialData.specifications : [emptySpecification],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'specifications' });
  const isFree = useWatch({ control, name: 'isFree' });
  const imagesUrl = useWatch({ control, name: 'imagesUrl' }) ?? [];

  useEffect(() => {
    if (!initialData) return;
    reset({
      title: initialData.title,
      price: initialData.price,
      isFree: initialData.price === 0,
      condition: initialData.condition,
      description: initialData.description,
      imagesUrl: initialData.imagesUrl,
      specifications: initialData.specifications.length ? initialData.specifications : [emptySpecification],
    });
  }, [initialData, reset]);

  useEffect(() => {
    if (isFree) setValue('price', 0, { shouldValidate: true });
  }, [isFree, setValue]);

  const submit = async (data: ProductFormData) => {
    try {
      const specifications = data.specifications
        .map(({ name, value }) => ({ name: name.trim(), value: value.trim() }))
        .filter(({ name, value }) => name || value);
      await onSubmit({
        ...data,
        title: data.title.trim(),
        price: data.isFree ? 0 : Number(data.price),
        description: data.description.trim(),
        imagesUrl: data.imagesUrl.slice(0, 20),
        specifications,
      });
    } catch {
      setError('root.serverError', { message: 'Не удалось сохранить товар. Попробуйте ещё раз.' });
    }
  };

  return (
    <div className={styles.productFormWrapper}>
      <div className={styles.titleWrapper}>
        <h2 className={styles.title}>{initialData ? 'Редактирование товара' : 'Добавление товара'}</h2>
      </div>
      <form onSubmit={handleSubmit(submit)} className={styles.productForm} noValidate>
        <ImgLoader />
        <div className={styles.productFormField}>
          <TextInput
            {...register('title', {
              required: 'Введите заголовок товара',
              validate: (value) => value.trim().length > 0 || 'Введите заголовок товара',
              maxLength: { value: 255, message: 'Заголовок не должен превышать 255 символов' },
            })}
            className={styles.input}
            placeholder='Заголовок товара'
            errorText={getErrorMessage(errors.title)}
            aria-invalid={Boolean(errors.title)}
          />
        </div>
        <div className={styles.productPriceInfo}>
          <div className={styles.productFormField}>
            <TextInput
              {...register('price', {
                valueAsNumber: true,
                required: 'Укажите цену',
                min: { value: 0, message: 'Цена не может быть отрицательной' },
                validate: (value) => Number.isInteger(value) || 'Цена должна быть целым числом',
              })}
              type='number'
              min='0'
              step='1'
              disabled={isFree}
              className={styles.input}
              placeholder='Цена в рублях'
              errorText={getErrorMessage(errors.price)}
              aria-invalid={Boolean(errors.price)}
            />
          </div>
          <div className={styles.productFormField}>
            <Checkbox {...register('isFree')} name="isFree" label="Отдам даром" />
          </div>
        </div>
        <div className={styles.productFormField}>
          <Textarea
            {...register('description', {
              required: 'Добавьте описание товара',
              validate: (value) => value.trim().length > 0 || 'Добавьте описание товара',
              maxLength: { value: 10000, message: 'Описание не должно превышать 10 000 символов' },
            })}
            placeholder='Описание товара'
            errorText={getErrorMessage(errors.description)}
            aria-invalid={Boolean(errors.description)}
          />
        </div>
        <div className={styles.productCondition}>
          <span className={styles.productConditionLabel}>Состояние товара</span>
          <div className={styles.productConditionOptions}>
            <Radio {...register('condition', { required: 'Выберите состояние товара' })} value='new' label='Новое' />
            <Radio {...register('condition', { required: 'Выберите состояние товара' })} value='used' label='Б/У' />
          </div>
          {errors.condition && <div role="alert">{getErrorMessage(errors.condition)}</div>}
        </div>
        <div className={styles.productSpecifications}>
          <div className={styles.productSpecificationsLabel}>Спецификации товара</div>
          <div className={styles.productSpecificationsItems}>
            {fields.map((field, index) => (
              <div className={styles.productSpecificationsItem} key={field.id}>
                <TextInput
                  {...register(`specifications.${index}.name`, {
                    validate: (value, formValues) => {
                      const other = formValues.specifications[index].value.trim();
                      return (!value.trim() && !other) || value.trim().length > 0 || 'Введите название параметра';
                    },
                  })}
                  className={styles.input}
                  placeholder='Название параметра'
                  errorText={getErrorMessage(errors.specifications?.[index]?.name)}
                />
                <TextInput
                  {...register(`specifications.${index}.value`, {
                    validate: (value, formValues) => {
                      const other = formValues.specifications[index].name.trim();
                      return (!value.trim() && !other) || value.trim().length > 0 || 'Введите значение параметра';
                    },
                  })}
                  className={styles.input}
                  placeholder='Значение параметра'
                  errorText={getErrorMessage(errors.specifications?.[index]?.value)}
                />
                <Button type="button" className={styles.productSpecificationsDeleleButton} onClick={() => remove(index)} aria-label="Удалить спецификацию">
                  <DeleteIcon className={styles.productSpecificationsDeleleIcon} />
                </Button>
              </div>
            ))}
          </div>
          <div className={styles.productSpecificationsAddItems}>
            <Button type="button" onClick={() => append(emptySpecification)}>Добавить строку</Button>
          </div>
        </div>
        {errors.root?.serverError && <div role="alert">{getErrorMessage(errors.root.serverError)}</div>}
        <div className={styles.productFormSubmitButton}>
          <Button view="positive" type="submit" isLoading={isSubmitting}>
            {initialData ? 'Сохранить изменения' : 'Добавить товар'}
          </Button>
        </div>
      </form>
    </div>
  );
}
