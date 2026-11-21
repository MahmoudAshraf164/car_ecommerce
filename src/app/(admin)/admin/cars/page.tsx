import { getCars, getBrandsAndModels } from "@/modules/admin/cars/actions/cars";
import { CarsTable } from "@/modules/admin/cars/components/cars-table";

interface AdminCarsPageProps {
  searchParams: Promise<{
    search?: string;
    brand_id?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminCarsPage({ searchParams }: AdminCarsPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const limit = parseInt(resolvedParams.limit || "10", 10);

  const [{ data: cars, total, totalPages }, { brands }] = await Promise.all([
    getCars({
      search: resolvedParams.search,
      brand_id: resolvedParams.brand_id,
      status: resolvedParams.status as any,
      page,
      limit,
    }),
    getBrandsAndModels(),
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <CarsTable
          cars={cars}
          brands={brands}
          total={total}
          page={page}
          pageSize={limit}
          totalPages={totalPages}
          currentFilters={resolvedParams}
        />
      </div>
    </div>
  );
}
