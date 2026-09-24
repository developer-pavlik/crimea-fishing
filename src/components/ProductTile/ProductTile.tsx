"use client";

import Image from "next/image";
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import Link from "next/link";
import cn from "clsx";
import styles from "./ProductTile.module.scss";
import 'swiper/css';
import 'swiper/css/pagination';

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
    return (
        <Link className={cn(styles.productTile, className)} href={href}>
            {imagesUrl[0] && (
                <div className={styles.imageWrapper}>
                    <Swiper
                        className={styles.slider}                  
                        modules={[Pagination]}
                        pagination={{ clickable: false }}
                        slidesPerView={1}
                        onSlideChange={() => console.log('slide change')}
                        onSwiper={(swiper) => console.log(swiper)}
                        >
                        <SwiperSlide>Slide 1</SwiperSlide>
                        <SwiperSlide>Slide 2</SwiperSlide>
                        <SwiperSlide>Slide 3</SwiperSlide>
                        <SwiperSlide>Slide 4</SwiperSlide>
                    </Swiper>
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


