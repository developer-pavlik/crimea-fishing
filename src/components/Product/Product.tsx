"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { deleteProduct } from '@/actions/products'
import PopupConfirmDeleteProduct from '@/components/PopupConfirmDeleteProduct/PopupConfirmDeleteProduct'
import styles from './Product.module.scss'
import { Button } from '@/components/ui/Button/Button'
import Link from 'next/link'
import ProductSlider from '@/components/ProductSlider/ProductSlider'
import ProductFavoritesButton from '@/components/ProductFavoriteButton/ProductFavoriteButton'
import ProductConditionLabel from '@/components/ProductConditionLabel/ProductConditionLabel'
import type { ProductCondition } from '@/types/product-form'

import DeleteIcon from '../../../public/icons/delete.svg';
import EditIcon from '../../../public/icons/edit.svg';
import FreeIcon from '../../../public/icons/free.svg';
import { formatPrice } from '@/lib/formatPrice';


export interface ProductProps {
    id: string;
    title: string;
    price: number;
    condition: ProductCondition;
    imagesUrl?: string[];
    description?: string | null;
    specifications?: Record<string, string>;
    inFavorites: boolean;
    isAuthenticated: boolean;
    canManage: boolean;
    author:  {
        id: string;
        name: string;
        avatarUrl?: string | null;
    };
}

const Product: React.FC<ProductProps> = ({ id, title, price, condition, description, specifications, author, imagesUrl, inFavorites, isAuthenticated, canManage }) => {
    const router = useRouter();
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string>();

    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);
        setDeleteError(undefined);

        try {
            const result = await deleteProduct(id);
            if (result.success) {
                setIsDeletePopupOpen(false);
                router.back();
                return;
            }

            const errorMessages = {
                unauthorized: "Требуется авторизация.",
                invalid_input: "Некорректный товар.",
                not_found: "Товар уже удалён или недоступен.",
                server_error: "Не удалось удалить товар. Попробуйте ещё раз.",
            } as const;
            setDeleteError(errorMessages[result.error]);
        } catch {
            setDeleteError("Не удалось удалить товар. Попробуйте ещё раз.");
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeletePopup = () => {
        setDeleteError(undefined);
        setIsDeletePopupOpen(true);
    };

    return (
        <div className={styles.product}>
            <div className={styles.content}>
                <div className={styles.main}>
                    <div className={styles.titleWrapper}> 
                        <h1 className={styles.title}>{title}</h1>
                        {isAuthenticated && (
                            <ProductFavoritesButton
                                productId={id}
                                isFavorite={inFavorites}
                                className={styles.favoriteButton}
                            />
                        )}
                    </div>
                    {imagesUrl && imagesUrl.length > 0 && <ProductSlider imagesUrl={imagesUrl} />}
                    {description && <div className={styles.description}>{description}</div>}
                    {specifications && Object.keys(specifications).length > 0 && (
                        <div className={styles.specifications}>
                            {Object.entries(specifications).map(([key, value]) => (
                                <div className={styles.specificationItem} key={key}>
                                    <div className={styles.specificationName}>{key}:</div>
                                    <div className={styles.specificationValue}>{value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className={styles.conditionText}>Состояние: <ProductConditionLabel className={styles.conditionLabel} condition={condition} /></p>
                </div>
                <div className={styles.sidebar}>      
                    {price === 0 ? (
                        <FreeIcon className={styles.freeIcon} aria-label="Бесплатно" role="img" />
                    ) : (
                        <div className={styles.price}>{formatPrice(price)} ₽</div>
                    )}
                    <Button className={styles.buyButton}>Написать продавцу</Button>
                    <div className={styles.sellerBox}>
                        <div className={styles.sellerLabel}>Продавец:</div>
                        <Link href={`/user/${author.id}`} className={styles.seller}>
                            {author.avatarUrl ? (
                                <Image
                                    className={styles.sellerAvatar}
                                    src={author.avatarUrl}
                                    alt={`Аватар продавца ${author.name}`}
                                    width={40}
                                    height={40}
                                    unoptimized
                                />
                            ) : (
                                <div className={styles.sellerAvatar} />
                            )}
                            <div className={styles.sellerName}>{author.name}</div>
                        </Link>
                    </div>
                    {isAuthenticated && canManage && (
                        <div className={styles.adminBox}>
                            <Button asLink href={`/product/${id}/edit`} view="secondary" className={styles.editButton}>
                                <EditIcon className={styles.editIcon} />
                                <span>Редактировать</span>
                            </Button>
                            <Button view="negative" className={styles.deleteButton} onClick={openDeletePopup}>
                                <DeleteIcon className={styles.deleteIcon} />
                                <span>Удалить</span>
                            </Button>
                            <PopupConfirmDeleteProduct
                                open={isDeletePopupOpen}
                                setOpen={setIsDeletePopupOpen}
                                productTitle={title}
                                onConfirm={handleDelete}
                                isLoading={isDeleting}
                                error={deleteError}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Product
