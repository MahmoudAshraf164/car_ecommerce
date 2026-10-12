import { getBrandsAndModels } from "@/modules/admin/cars/actions/cars";
import { BrandsManagementClient } from "@/modules/admin/brands/components/BrandsManagementClient";

export const metadata = {
  title: "إدارة الماركات والموديلات | لوحة التحكم",
};

export default async function BrandsManagementPage() {
  const { brands, error } = await getBrandsAndModels();

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {error && (
        <div className="max-w-7xl mx-auto p-4 mt-6 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
          ⚠️ تعذر تحميل الماركات: {error}
        </div>
      )}
      <BrandsManagementClient initialBrands={brands} />
    </div>
  );
}
