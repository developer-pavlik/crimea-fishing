import Image from "next/image";
import Link from "next/link";
import cn from "clsx";
import styles from "./ProductTile.module.scss";

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
                    {/* <Image
                        className={styles.image}
                        src={imagesUrl[0]}
                        alt={title}
                    /> */}
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


