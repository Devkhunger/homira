import { requireUser } from "@/lib/auth";
import ProfileForms from "@/components/account/ProfileForms";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  return (
    <>
      <h2 className="mb-6 text-2xl">Profile & password</h2>
      <ProfileForms name={user.name} email={user.email ?? ""} phone={user.phone ?? ""} />
    </>
  );
}
