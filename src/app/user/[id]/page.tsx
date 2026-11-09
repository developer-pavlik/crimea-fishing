import { notFound, redirect } from "next/navigation";
import InfiniteProductGrid from "@/components/InfiniteProductGrid/InfiniteProductGrid";
import ProductCatalogError from "@/components/ProductCatalogError/ProductCatalogError";
import Profile from "@/components/Profile/Profile";
import { getAccessSession } from "@/lib/auth";
import { getInitialProductPage } from "@/lib/products";
import { getPublicUserProfile, isUserId } from "@/lib/users";
import styles from "@/components/Profile/Profile.module.scss";

const userProductsUrl = (userId: string) =>
  `/api/user/${encodeURIComponent(userId)}/products`;

export const metadata = {
  title: "Профиль пользователя",
};

type UserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  if (!isUserId(id)) {
    notFound();
  }

  const [profile, session] = await Promise.all([
    getPublicUserProfile(id),
    getAccessSession(),
  ]);

  if (!profile) {
    notFound();
  }

  if (session?.userId === profile.id) {
    redirect("/profile");
  }

  const productsUrl = userProductsUrl(profile.id);
  const result = await getInitialProductPage({
    viewerId: session?.userId,
    sellerId: profile.id,
  });

  return (
    <Profile profile={profile} isOwnProfile={false}>
      {result.ok ? (
        <InfiniteProductGrid
          key={`${productsUrl}:${session?.userId ?? "guest"}`}
          className={styles.productGrid}
          initialPage={result.page}
          productsUrl={productsUrl}
          isAuthenticated={Boolean(session)}
        />
      ) : (
        <ProductCatalogError />
      )}
    </Profile>
  );
}
