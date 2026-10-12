import {
  Car,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";
export interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

const iconMap: Record<string, LucideIcon> = {
  Car,
  ShoppingCart,
  DollarSign,
  Users,
};

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    icon: "text-blue-600 bg-blue-50",
    badge: "text-blue-600 bg-blue-50",
  },
  green: {
    bg: "from-emerald-500 to-emerald-600",
    icon: "text-emerald-600 bg-emerald-50",
    badge: "text-emerald-600 bg-emerald-50",
  },
  amber: {
    bg: "from-amber-500 to-amber-600",
    icon: "text-amber-600 bg-amber-50",
    badge: "text-amber-600 bg-amber-50",
  },
  purple: {
    bg: "from-violet-500 to-violet-600",
    icon: "text-violet-600 bg-violet-50",
    badge: "text-violet-600 bg-violet-50",
  },
};

export interface StatsCardProps {
  stat?: StatCard;
  label?: string;
  value?: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon?: string;
  color?: string;
}

export function StatsCard(props: StatsCardProps) {
  const label = props.stat?.label || props.label || "";
  const value = props.stat?.value || props.value || "";
  const change = props.stat?.change || props.change || "";
  const changeType = props.stat?.changeType || props.changeType || "neutral";
  const icon = props.stat?.icon || props.icon || "Car";
  const color = props.stat?.color || props.color || "blue";

  const Icon = iconMap[icon] || Car;
  const colors = colorMap[color] || colorMap.blue;

  const ChangeIcon =
    changeType === "up"
      ? TrendingUp
      : changeType === "down"
      ? TrendingDown
      : Minus;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/80 transition-all duration-300 overflow-hidden">
      {/* Gradient accent top */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-l ${colors.bg} opacity-80`}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                changeType === "up"
                  ? "text-emerald-600 bg-emerald-50"
                  : changeType === "down"
                  ? "text-rose-600 bg-rose-50"
                  : "text-slate-500 bg-slate-100"
              }`}
            >
              <ChangeIcon className="w-3 h-3" />
              {change}
            </span>
            <span className="text-[10px] text-slate-400">هذا الشهر</span>
          </div>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
