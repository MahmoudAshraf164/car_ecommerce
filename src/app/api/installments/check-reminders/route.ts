import { NextResponse } from "next/server";
import { checkAndSendInstallmentReminders } from "@/modules/admin/installments/actions/installments";

export async function GET() {
  const result = await checkAndSendInstallmentReminders();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await checkAndSendInstallmentReminders();
  return NextResponse.json(result);
}
