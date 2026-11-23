import type { Metadata } from "next";
import "../styles/fonts.scss";
import "../styles/globals.scss";
import "../styles/normalize.scss";

export const metadata: Metadata = {
    title: "Рыбацкая барахолка",
    description: "Рыбацкая барахолка - это онлайн-платформа для рыболовов, где вы можете купить, продать или обменять рыболовные снасти и аксессуары. Здесь вы найдете широкий ассортимент товаров для рыбалки, включая удочки, катушки, приманки, одежду и многое другое. Присоединяйтесь к сообществу рыболовов и делитесь своими находками и опытом!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="ru">
            <body>
                {children}
            </body>
        </html>
    );
}