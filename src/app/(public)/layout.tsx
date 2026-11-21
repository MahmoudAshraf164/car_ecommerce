import { PublicHeader, PublicFooter } from "@/modules/public/components/HeaderFooter";
import { getCompanySettings } from "@/modules/shared/lib/settings.server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showroom, contacts } = await getCompanySettings();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex flex-col justify-between" dir="rtl">
      <PublicHeader showroom={showroom} contacts={contacts} />
      <main className="flex-1">{children}</main>
      <PublicFooter showroom={showroom} contacts={contacts} />
    </div>
  );
}
