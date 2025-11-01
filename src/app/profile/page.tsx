import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import ProfileContent from "@/components/profile/profile-content";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Fetch user with basic profile data for layout
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const layoutProps = {
    userRole: user.role,
    userName: user.profile?.displayName || null,
    userEmail: user.email,
    avatarUrl: user.profile?.avatarUrl || null,
  };

  return (
    <DashboardLayout {...layoutProps}>
      <ProfileContent />
    </DashboardLayout>
  );
}
