import { getProtectionFilms } from "@/modules/public/actions/protection-films";
import { ProtectionFilmsAdminClient } from "@/modules/admin/dashboard/components/ProtectionFilmsAdminClient";

export const metadata = {
  title: "إدارة أفلام الحماية | لوحة التحكم",
};

export default async function AdminProtectionFilmsPage() {
  const { data: films, error } = await getProtectionFilms();

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {error && (
        <div className="max-w-7xl mx-auto p-4 mt-6 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
          ⚠️ تعذر تحميل البيانات: {error}
        </div>
      )}
      <ProtectionFilmsAdminClient initialFilms={films} />
    </div>
  );
}
