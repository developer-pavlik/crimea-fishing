import { notFound } from "next/navigation";
import Profile from "@/components/Profile/Profile";
import { getAccessSession } from "@/lib/auth";
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

  const [profile, session] = await Promise.all([
    getPublicUserProfile(id),
    getAccessSession(),
  ]);

  if (!profile) {
    notFound();
  }

  return <Profile profile={profile} isOwnProfile={session?.userId === profile.id} />;
}
