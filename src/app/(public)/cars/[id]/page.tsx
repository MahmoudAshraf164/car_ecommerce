import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarByIdOrSlug } from "@/modules/public/actions/cars";
import { CarDetailsView } from "@/modules/public/cars/components/car-details-view";

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: car } = await getCarByIdOrSlug(resolvedParams.id);

  if (!car) {
    return {
      title: "السيارة غير موجودة | أولاد العم",
      description: "السيارة المطلوبة غير متاحة أو تم إزالتها.",
    };
  }

  const primaryImage =
    car.car_images?.find((img) => img.is_primary)?.image_url ||
    car.car_images?.[0]?.image_url ||
    "/placeholder-car.jpg";

  return {
    title: `${car.title} | أولاد العم للسيارات`,
    description:
      car.description ||
      `اعرض تفاصيل ${car.title} موديل ${car.year} بسعر ${car.price.toLocaleString("ar-EG")} ج.م في معرض أولاد العم.`,
    openGraph: {
      title: car.title,
      description: car.description || `اعرض تفاصيل ${car.title} موديل ${car.year}`,
      images: [{ url: primaryImage }],
    },
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const resolvedParams = await params;
  const { data: car } = await getCarByIdOrSlug(resolvedParams.id);

  if (!car) {
    notFound();
  }

  const primaryImage =
    car.car_images?.find((img) => img.is_primary)?.image_url ||
    car.car_images?.[0]?.image_url ||
    "/placeholder-car.jpg";

  // Schema.org Vehicle JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: car.title,
    description: car.description || car.title,
    image: primaryImage,
    modelDate: String(car.year),
    vehicleTransmission: car.transmission,
    fuelType: car.fuel_type,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.mileage,
      unitCode: "KMT",
    },
    brand: {
      "@type": "Brand",
      name: car.brand?.name || "Unspecified",
    },
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "EGP",
      availability:
        car.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition:
        car.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto">
        <CarDetailsView car={car} />
      </div>
    </div>
  );
}
