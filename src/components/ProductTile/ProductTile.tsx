"use client";

import Image from 'next/image';
import type { Swiper as SwiperInstance } from 'swiper';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useRef } from 'react';

import Link from "next/link";
import cn from "clsx";
import styles from "./ProductTile.module.scss";
import 'swiper/css';
import 'swiper/css/pagination';


import PrevIcon from '../../../public/icons/prev.svg';
import NextIcon from '../../../public/icons/next.svg';

export interface ProductTileProps {
    title: string;
    price: number;
    imagesUrl: string[];
    href: string;
    className?: string;
}

const ProductTile = ({
    title,
    price,
    imagesUrl,
    href,
    className,
}: ProductTileProps) => {

    const swiperRef = useRef<SwiperInstance | null>(null);

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
        <Link className={cn(styles.productTile, className)} href={href}>
            {imagesUrl[0] && (
                <div className={styles.imageWrapper}>
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
                    <button className={styles.sliderButtonPrev} onClick={(event) => handleNavClick(event, 'prev')}>
                        <PrevIcon  className={styles.sliderButtonIcon}/>
                    </button>
                    <button className={styles.sliderButtonNext} onClick={(event) => handleNavClick(event, 'next')}>
                        <NextIcon className={styles.sliderButtonIcon}/>
                    </button>
                </div>
            )}
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <span className={styles.price}>{price} ₽</span>
            </div>
        </Link>
    );
};

export default ProductTile;


