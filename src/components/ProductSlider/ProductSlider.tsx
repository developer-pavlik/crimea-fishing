"use client"

import React from 'react'
import styles from './ProductSlider.module.scss'
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Thumbs, FreeMode, Navigation  } from 'swiper/modules';
import PrevIcon from '../../../public/icons/prev.svg';
import NextIcon from '../../../public/icons/next.svg';
import 'swiper/css';
import 'swiper/css/free-mode';
import cn from 'clsx'


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
                    modules={[Thumbs, Navigation]}
                    navigation={{
                        nextEl: '.productSliderButtonNext',
                        prevEl: '.productSliderButtonPrev',
                    }}
                    slidesPerView={1}
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
                <button className={cn('productSliderButtonPrev', styles.sliderButtonPrev)}>
                    <PrevIcon  className={styles.sliderButtonIcon}/>
                </button>
                <button className={cn('productSliderButtonNext', styles.sliderButtonNext)}>
                    <NextIcon className={styles.sliderButtonIcon}/>
                </button>
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
