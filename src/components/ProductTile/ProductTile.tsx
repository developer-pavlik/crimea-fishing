"use client";

import Image from 'next/image';
import type { Swiper as SwiperInstance } from 'swiper';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useRef, useState } from 'react';
import ProductTileMenu from '../ProductTileMenu/ProductTileMenu';
import ProductFavoriteButton from '../ProductFavoriteButton/ProductFavoriteButton';
import DefaultImgIcon from '../../../public/icons/empty-img.svg';

import Link from "next/link";
import cn from "clsx";
import styles from "./ProductTile.module.scss";
import 'swiper/css';
import 'swiper/css/pagination';


import PrevIcon from '../../../public/icons/prev.svg';
import NextIcon from '../../../public/icons/next.svg';
import FreeIcon from '../../../public/icons/free.svg';
import { formatPrice } from '@/lib/formatPrice';

export interface ProductTileProps {
    id: string;
    isFavorite: boolean;
    title: string;
    price: number;
    imagesUrl: string[];
    className?: string;
}

const ProductTile = ({
    id,
    isFavorite,
    title,
    price,
    imagesUrl,
    className,
    isAuthenticated,
}: ProductTileProps & { isAuthenticated: boolean }) => {

    const swiperRef = useRef<SwiperInstance | null>(null);
    const [favorite, setFavorite] = useState(isFavorite);

    const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>, direction: 'prev' | 'next') => {
        e.preventDefault();
        e.stopPropagation();

        if (direction === 'prev') {
            swiperRef.current?.slidePrev();
        } else {
            swiperRef.current?.slideNext();
        }
    };

    return (
        <div className={styles.productTileWrapper}>
            <Link className={cn(styles.productTile, className)} href={`/product/${id}`}>
                <div className={styles.imageWrapper}>
                    {imagesUrl.length > 0 ? (
                        <>
                            <Swiper
                                className={styles.slider}
                                modules={[Pagination]}
                                pagination={{ clickable: false }}
                                slidesPerView={1}
                                loop={true}
                                onSwiper={(swiper) => {
                                    swiperRef.current = swiper;
                                }}
                            >
                                {
                                    imagesUrl.map((imageUrl, index) => (
                                        <SwiperSlide key={index}>
                                            <Image
                                                src={imageUrl}
                                                alt={title}
                                                className={styles.image}
                                                fill
                                            />
                                        </SwiperSlide>
                                    ))
                                }
                            </Swiper>
                            {imagesUrl.length > 1 && (
                                <>
                                    <button className={styles.sliderButtonPrev} onClick={(event) => handleNavClick(event, 'prev')}>
                                        <PrevIcon className={styles.sliderButtonIcon} />
                                    </button>
                                    <button className={styles.sliderButtonNext} onClick={(event) => handleNavClick(event, 'next')}>
                                        <NextIcon className={styles.sliderButtonIcon} />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <DefaultImgIcon className={styles.defaultImage} aria-hidden="true" />
                    )}
                </div>
                <div className={styles.content}>
                    <h3 className={styles.title}>{title}</h3>
                    {price === 0 ? (
                        <FreeIcon className={styles.freeIcon} aria-label="Бесплатно" role="img" />
                    ) : (
                        <span className={styles.price}>{formatPrice(price)} ₽</span>
                    )}
                </div>
            </Link>
            <ProductTileMenu />
            {isAuthenticated && (
                <ProductFavoriteButton
                    productId={id}
                    isFavorite={favorite}
                    className={styles.favoriteButton}
                    onFavoriteChange={setFavorite}
                />
            )}
        </div>
    );
};

export default ProductTile;
