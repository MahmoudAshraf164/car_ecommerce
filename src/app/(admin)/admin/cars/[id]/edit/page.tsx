export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { getCarById, getBrandsAndModels, getFeatures } from "@/modules/admin/cars/actions/cars";
import { CarForm } from "@/modules/admin/cars/components/car-form";


interface EditCarPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: EditCarPageProps) {
  const resolvedParams = await params;
  const { data: car } = await getCarById(resolvedParams.id);

  if (!car) {
    notFound();
  }

  const { brands } = await getBrandsAndModels();
  const { features } = await getFeatures();

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
      <CarForm initialCar={car} brands={brands} featuresList={features} />
    </div>
  );
}
