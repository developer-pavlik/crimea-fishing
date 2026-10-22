import { redirect } from "next/navigation";
import { getAccessSession } from "@/lib/auth";
import Profile from "@/components/Profile/Profile";

export const metadata = {
  title: "Профиль | Мои товары",
};

export default async function ProfilePage() {
  const session = await getAccessSession();

  if (!session) {
    redirect("/");
  }

  return <Profile />;
}
