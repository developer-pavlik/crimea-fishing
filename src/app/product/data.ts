import type { ProductProps } from "@/components/Product/Product";

export const productData: ProductProps = {
    title: "Плавник с электромотором Aqua Marina Bluedrive K",
    price: 1000,
    imagesUrl: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
        "Надежный электромотор Aqua Marina Bluedrive K для комфортной рыбалки и спокойного перемещения по воде. Компактная конструкция, высокая мощность и удобное управление делают модель отличным выбором для любителей активного отдыха на воде.",
    specifications: {
        "Мощность": "55 л.с.",
        "Напряжение": "12 В",
        "Вес": "18 кг",
        "Материал": "Нержавеющая сталь и композит",
        "Длина": "1,8 м",
        "Тип": "Электромотор",
    },
    inFavorites: false,
    author: {
        name: "Иван Петров",
        avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
};
