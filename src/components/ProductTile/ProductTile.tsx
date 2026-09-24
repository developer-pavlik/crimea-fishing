"use client";

import Image from "next/image";
import { Pagination, Navigation } from 'swiper/modules';
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

    const handleNavClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Navigation button clicked');
    };



    return (
        <Link className={cn(styles.productTile, className)} href={href}>
            {imagesUrl[0] && (
                <div className={styles.imageWrapper}>
                    <Swiper
                        className={styles.slider}                  
                        modules={[Pagination, Navigation]}
                        pagination={{ clickable: false }}
                        navigation={{
                            nextEl: '.my-custom-next',
                            prevEl: '.my-custom-prev',
                        }}
                        slidesPerView={1}
                        onSlideChange={() => console.log('slide change')}
                        onSwiper={(swiper) => console.log(swiper)}
                        >
                        <SwiperSlide>Slide 1</SwiperSlide>
                        <SwiperSlide>Slide 2</SwiperSlide>
                        <SwiperSlide>Slide 3</SwiperSlide>
                        <SwiperSlide>Slide 4</SwiperSlide>
                    </Swiper>
                    <button className={cn('my-custom-prev', styles.sliderButtonPrev)} onClick={handleNavClick}>
                        Назад
                    </button>
                    <button className={cn('my-custom-next', styles.sliderButtonNext)} onClick={handleNavClick}>
                        Вперед
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


