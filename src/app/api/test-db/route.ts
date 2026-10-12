import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Diagnostic: verify env vars are loaded
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Environment variables are missing",
        debug: {
          NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "✅ loaded" : "❌ missing",
          SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey ? "✅ loaded" : "❌ missing",
        },
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم الاتصال بنجاح بقاعدة البيانات! ✅",
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}