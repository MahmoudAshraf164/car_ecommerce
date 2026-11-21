export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProtectionFilmByIdOrSlug } from "@/modules/public/actions/protection-films";
import { ProtectionFilmDetailClient } from "@/modules/public/cars/components/ProtectionFilmDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: film } = await getProtectionFilmByIdOrSlug(id);

  if (!film) {
    return {
      title: "الباقة غير موجودة | أولاد العم",
      description: "الباقة المطلوبة غير متاحة أو تم إزالتها.",
    };
  }

  const primaryImage =
    film.protection_film_images?.find((img) => img.is_primary)?.image_url ||
    film.protection_film_images?.[0]?.image_url ||
    undefined;

  return {
    title: `${film.title} | أفلام الحماية - أولاد العم`,
    description:
      film.description ||
      `تعرف على باقة ${film.title} من أولاد العم لأفلام الحماية والنانو سيراميك.`,
    openGraph: {
      title: film.title,
      description: film.description || film.title,
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProtectionFilmDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data: film } = await getProtectionFilmByIdOrSlug(id);

  if (!film) {
    notFound();
  }

  return <ProtectionFilmDetailClient film={film} />;
}
