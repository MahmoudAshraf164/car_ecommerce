"use server";

import { createServerClient } from "@/modules/shared/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AdminNotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: any;
  created_at: string;
}

export async function getAdminNotifications(): Promise<{
  data: AdminNotificationItem[];
  unreadCount: number;
}> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !data) {
      return { data: [], unreadCount: 0 };
    }

    const unread = data.filter((n: any) => !n.is_read).length;
    return { data, unreadCount: unread };
  } catch {
    return { data: [], unreadCount: 0 };
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    revalidatePath("/admin");
    return true;
  } catch {
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    revalidatePath("/admin");
    return true;
  } catch {
    return false;
  }
}
