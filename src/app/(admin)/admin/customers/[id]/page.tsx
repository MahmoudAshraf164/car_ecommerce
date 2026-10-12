import { createServerClient } from "@/modules/shared/lib/supabase/server";
import CustomerProfileClient from "./CustomerProfileClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "ملف العميل | لوحة التحكم",
};

export default async function Customer360HubPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const supabase = await createServerClient();
  
  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      `
      *,
      leads(
        *,
        cars(title, price, body_type),
        protection_films(title, price)
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !customer) {
    console.error("Error fetching customer:", error);
    return notFound();
  }

  return <CustomerProfileClient customer={customer} />;
}
