import { getBrandsAndModels, getFeatures } from "@/modules/admin/cars/actions/cars";
import { CarForm } from "@/modules/admin/cars/components/car-form";

export default async function NewCarPage() {
  const { brands } = await getBrandsAndModels();
  const { features } = await getFeatures();

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <CarForm brands={brands} featuresList={features} />
    </div>
  );
}

