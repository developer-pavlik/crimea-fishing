import { redirect } from "next/navigation";
import { getAccessSession } from "@/lib/auth";
import Profile from "@/components/Profile/Profile";

export const metadata = {
  title: "Профиль | Мое избранное",
};

export default async function FavoritesPage() {
  const session = await getAccessSession();

  if (!session) {
    redirect("/");
  }

  return <Profile />;
}
