import type { ProductProps } from "@/components/Product/Product";

export const productData: ProductProps = {
    title: "Плавник с электромотором Aqua Marina Bluedrive K",
    price: 1000,
    imagesUrl: [
        "https://ir.ozone.ru/s3/multimedia-1-w/wc2500/7827556172.jpg",
        "https://ir.ozone.ru/s3/multimedia-1-v/wc2500/7598981299.jpg",
        "https://ir.ozone.ru/s3/multimedia-1-w/wc2500/7598981480.jpg",
        "https://ir.ozone.ru/s3/multimedia-1-b/wc2500/7598981423.jpg",
        "https://ir.ozone.ru/s3/multimedia-1-m/wc2500/7598981290.jpg",
        "https://ir.ozone.ru/s3/multimedia-1-t/wc2500/7598981405.jpg",
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
