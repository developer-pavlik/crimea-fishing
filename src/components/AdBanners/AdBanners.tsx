import styles from "./AdBanners.module.scss";
import BannerSlider from "../BannerSlider/BannerSlider";

const featuredBanners = [
    { src: '/banners/1.jpg', alt: 'Рекламный баннер 1' },
    { src: '/banners/2.jpg', alt: 'Рекламный баннер 2' },
    { src: '/banners/3.jpg', alt: 'Рекламный баннер 3' },
];

const productBanners = [
    { src: '/banners/products/p1.jpg', alt: 'Товарный баннер 1' },
    { src: '/banners/products/p2.jpg', alt: 'Товарный баннер 2' },
    { src: '/banners/products/p3.jpg', alt: 'Товарный баннер 3' },
];

const AdBanners = () => (
    <section className={styles.adBanners} aria-label="Рекламные баннеры">
        <article className={styles.featuredBanner}>
            <BannerSlider banners={featuredBanners} />
        </article>

        <article className={styles.secondaryBanner}>
            <BannerSlider banners={productBanners} sizes="30vw" />
        </article>
    </section>
);

export default AdBanners;
