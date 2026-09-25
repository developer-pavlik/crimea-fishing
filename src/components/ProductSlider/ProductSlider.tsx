"use client"

import React from 'react'
import styles from './ProductSlider.module.scss'
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';


export interface ProductSliderProps {
    imagesUrl: string[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ imagesUrl }) => {
    return (
        <div className={styles.productSlider}>
            <div className={styles.productSliderInner}>
                <Swiper
                    className={styles.slider}                  
                    slidesPerView={1}
                    loop={true}
                    >
                    {
                        imagesUrl.map((imageUrl, index) => (
                            <SwiperSlide key={index}>
                                <Image
                                    src={imageUrl}
                                    alt='Какртика'
                                    className={styles.image}
                                    fill
                                />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>
            слайдер блять
        </div>
    )
}

export default ProductSlider
