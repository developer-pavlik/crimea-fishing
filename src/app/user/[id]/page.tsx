import { notFound } from "next/navigation";
import Profile from "@/components/Profile/Profile";
import { getPublicUserProfile, isUserId } from "@/lib/users";

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

  const profile = await getPublicUserProfile(id);

  if (!profile) {
    notFound();
  }

  return <Profile profile={profile} isOwnProfile={false} />;
}
