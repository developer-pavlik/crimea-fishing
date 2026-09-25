"use client"

import React from 'react'
import styles from './ProductSlider.module.scss'
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';


export interface ProductSliderProps {
    imagesUrl: string[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ imagesUrl }) => {
    const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperInstance | null>(null);

    return (
        <div className={styles.productSlider}>
            <div className={styles.productSliderInner}>
                <Swiper
                    className={styles.slider}
                    modules={[Thumbs]}
                    slidesPerView={1}
                    loop={true}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    >
                    {
                        imagesUrl.map((imageUrl, index) => (
                            <SwiperSlide key={index}>
                                <Image
                                    src={imageUrl}
                                    alt={`Изображение товара ${index + 1}`}
                                    className={styles.image}
                                    fill
                                />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>
            <Swiper
                className={styles.thumbs}
                modules={[Thumbs, FreeMode]}
                onSwiper={setThumbsSwiper}
                spaceBetween={12}
                slidesPerView={8}
                freeMode={true}
                watchSlidesProgress={true}
            >
                {imagesUrl.map((imageUrl, index) => (
                    <SwiperSlide className={styles.thumb} key={index}>
                        <Image
                            src={imageUrl}
                            alt={`Миниатюра изображения ${index + 1}`}
                            className={styles.thumbImage}
                            fill
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

export default ProductSlider
