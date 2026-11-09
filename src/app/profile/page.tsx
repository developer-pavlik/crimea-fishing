import { notFound, redirect } from "next/navigation";
import { getAccessSession } from "@/lib/auth";
import { getPublicUserProfile } from "@/lib/users";
import Profile from "@/components/Profile/Profile";
import InfiniteProductGrid from "@/components/InfiniteProductGrid/InfiniteProductGrid";
import ProductCatalogError from "@/components/ProductCatalogError/ProductCatalogError";
import { getInitialProductPage } from "@/lib/products";
import styles from "@/components/Profile/Profile.module.scss";

export const metadata = {
  title: "Профиль | Мои товары",
};

export default async function ProfilePage() {
  const session = await getAccessSession();

  if (!session) {
    redirect("/");
  }

  const profile = await getPublicUserProfile(session.userId);

  if (!profile) {
    notFound();
  }

  const result = await getInitialProductPage({
    viewerId: session.userId,
    sellerId: session.userId,
  });

  return (
    <Profile profile={profile} isOwnProfile>
      {result.ok ? (
        <InfiniteProductGrid
          key={`/api/profile/products:${session.userId}`}
          className={styles.productGrid}
          initialPage={result.page}
          productsUrl="/api/profile/products"
          isAuthenticated
        />
      ) : (
        <ProductCatalogError />
      )}
    </Profile>
  );
}
