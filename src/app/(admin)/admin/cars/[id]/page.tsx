import { redirect } from "next/navigation";

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const resolvedParams = await params;
  redirect(`/admin/cars/${resolvedParams.id}/edit`);
}
