export const dynamic = 'force-dynamic';
import { getAdminSettingsData } from "@/modules/admin/dashboard/actions/settings";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const metadata = {
  title: "إعدادات المنظومة والمعرض | لوحة الإدارة",
  description: "إدارة بيانات المعرض، أرقام التواصل الحية، الأمان، وبانر الواجهة الرئيسية",
};

export default async function AdminSettingsPage() {
  const { profile, showroom, contacts, hero } = await getAdminSettingsData();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminSettingsClient
        initialProfile={profile}
        initialShowroom={showroom}
        initialContacts={contacts}
        initialHero={hero}
      />
    </div>
  );
}
