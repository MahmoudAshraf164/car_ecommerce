import {
  Car,
  ShoppingCart,
  UserPlus,
  Tags,
  type LucideIcon,
} from "lucide-react";
export interface RecentActivity {
  id: string;
  action: string;
  subject: string;
  time: string;
  type: "car" | "order" | "user" | "brand" | string;
}

const typeConfig: Record<
  string,
  { icon: LucideIcon; color: string; bg: string }
> = {
  car: { icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
  order: { icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50" },
  user: { icon: UserPlus, color: "text-violet-600", bg: "bg-violet-50" },
  brand: { icon: Tags, color: "text-amber-600", bg: "bg-amber-50" },
};

interface RecentActivityTableProps {
  activities: RecentActivity[];
}

export function RecentActivityTable({ activities }: RecentActivityTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            آخر النشاطات
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            أحدث العمليات في النظام
          </p>
        </div>
        <button className="text-[11px] font-bold text-amber-600 hover:text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
          عرض الكل
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {activities.map((activity) => {
          const config = typeConfig[activity.type] || typeConfig.car;
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors group"
            >
              <div
                className={`w-9 h-9 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-600 truncate">
                  {activity.action}
                </p>
                <p className="text-[11px] font-bold text-slate-900 truncate">
                  {activity.subject}
                </p>
              </div>

              <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap shrink-0">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
