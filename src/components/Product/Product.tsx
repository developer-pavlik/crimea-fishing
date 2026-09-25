import React from 'react'
import styles from './Product.module.scss'
import { Button } from '@/components/ui/Button/Button'
import Link from 'next/link'
import ProductSlider from '@/components/ProductSlider/ProductSlider'




export interface ProductProps {
    title: string;
    price: number;
    imagesUrl?: string[];
    description: string;
    specifications?: Record<string, string>;
    inFavorites?: boolean;
    author:  {
        name: string;
        avatarUrl?: string;
    };
}

const Product: React.FC<ProductProps> = ({ title, price, description, specifications, author, imagesUrl }) => {
    return (
        <div className={styles.product}>
            <div className={styles.content}>
                <div className={styles.main}>
                    <h1 className={styles.title}>{title}</h1>
                    {imagesUrl && <ProductSlider imagesUrl={imagesUrl} />}
                    <div className={styles.description}>{description}</div>
                    {specifications && (
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
                            <div className={styles.sellerAvatar}></div>
                            <div className={styles.sellerName}>{author.name}</div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Product
