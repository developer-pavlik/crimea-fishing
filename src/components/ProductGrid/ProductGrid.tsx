import React from 'react'
import styles from './ProductGrid.module.scss'
import type { ProductTileProps } from '../ProductTile/ProductTile'
import cn from "clsx";
import ProductTile from '../ProductTile/ProductTile'



export interface ProductGridProps {
    className?: string;
    items:  ProductTileProps[];
    isAuthenticated: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ className, items, isAuthenticated }) => {
    return (
        <div className={cn(styles.productGrid, className)}>
            {items.map((item) => (
                <ProductTile key={item.id} {...item} isAuthenticated={isAuthenticated} />
            ))}
        </div>
    )
}

export default ProductGrid
