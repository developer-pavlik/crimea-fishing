import React from 'react'
import Image from 'next/image'
import styles from './Product.module.scss'
import { Button } from '@/components/ui/Button/Button'
import Link from 'next/link'
import ProductSlider from '@/components/ProductSlider/ProductSlider'
import ProductFavoritesButton from '@/components/ProductFavoriteButton/ProductFavoriteButton'




export interface ProductProps {
    id: string;
    title: string;
    price: number;
    imagesUrl?: string[];
    description?: string | null;
    specifications?: Record<string, string>;
    inFavorites: boolean;
    isAuthenticated: boolean;
    author:  {
        name: string;
        avatarUrl?: string | null;
    };
}

const Product: React.FC<ProductProps> = ({ id, title, price, description, specifications, author, imagesUrl, inFavorites, isAuthenticated }) => {
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
                </div>
                <div className={styles.sidebar}>
                    <div className={styles.price}>{price} ₽</div>
                    <Button className={styles.buyButton}>Написать продавцу</Button>
                    <div className={styles.sellerBox}>
                        <div className={styles.sellerLabel}>Продавец:</div>
                        <Link href="/chat" className={styles.seller}>
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
                </div>
            </div>
        </div>
    )
}

export default Product
