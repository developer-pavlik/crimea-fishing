'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import styles from './BannerSlider.module.scss';

interface Banner {
    src: string;
    alt: string;
    href?: string;
}

interface BannerSliderProps {
    banners: Banner[];
    sizes?: string;
    delay?: number;
}

const BannerSlider = ({ banners, sizes = '70vw', delay = 5000 }: BannerSliderProps) => (
    <Swiper
        className={styles.slider}
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={{ clickable: true }}
        autoplay={{ delay, disableOnInteraction: false }}
        loop
        speed={600}
    >
        {banners.map((banner) => (
            <SwiperSlide key={banner.src} className={styles.slide}>
                <a href={banner.href ?? ''} className={styles.link}>
                    <Image
                        src={banner.src}
                        alt={banner.alt}
                        fill
                        sizes={sizes}
                        style={{ objectFit: 'cover' }}
                    />
                </a>
            </SwiperSlide>
        ))}
    </Swiper>
);

export default BannerSlider;
