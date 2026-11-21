import { getAdminSidebarCounts } from "@/modules/admin/dashboard/actions/executive-dashboard";
import { getAdminNotifications } from "@/modules/admin/dashboard/actions/notifications";
import { AdminShellClient } from "./AdminShellClient";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const [counts, notifs] = await Promise.all([
    getAdminSidebarCounts(),
    getAdminNotifications(),
  ]);

  return (
    <AdminShellClient
      counts={counts}
      initialNotifications={notifs.data}
      initialUnreadCount={notifs.unreadCount}
    >
      {children}
    </AdminShellClient>
  );
}
