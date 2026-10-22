import { notFound, redirect } from "next/navigation";
import { getAccessSession } from "@/lib/auth";
import { getPublicUserProfile } from "@/lib/users";
import Profile from "@/components/Profile/Profile";

export const metadata = {
  title: "Профиль | Мое избранное",
};

export default async function FavoritesPage() {
  const session = await getAccessSession();

  if (!session) {
    redirect("/");
  }

  const profile = await getPublicUserProfile(session.userId);

  if (!profile) {
    notFound();
  }

  return <Profile profile={profile} isOwnProfile />;
}
