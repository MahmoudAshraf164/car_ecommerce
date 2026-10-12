"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Lock,
  Eye,
  Check,
  X,
  UserPlus,
  Key,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "sales_manager" | "content_editor" | "support";
  status: "active" | "inactive";
  joinedDate: string;
  avatar: string;
}

const mockMembers: TeamMember[] = [
  {
    id: "usr-1",
    name: "م. أحمد العمدة",
    email: "ahmed@elomda.com",
    role: "super_admin",
    status: "active",
    joinedDate: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  },
  {
    id: "usr-2",
    name: "سارة الشمري",
    email: "sara@elomda.com",
    role: "sales_manager",
    status: "active",
    joinedDate: "2024-03-10",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "usr-3",
    name: "خالد الحربي",
    email: "khalid@elomda.com",
    role: "content_editor",
    status: "active",
    joinedDate: "2024-05-20",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "usr-4",
    name: "محمود حسن",
    email: "mahmoud@elomda.com",
    role: "support",
    status: "inactive",
    joinedDate: "2024-07-01",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
];

const modulesList = [
  "السيارات الفاخرة",
  "السكوترات",
  "العقارات والأبراج",
  "الطلبات والعملاء",
  "التقارير المالية",
  "إعدادات المنظومة",
];

const rolesList = [
  { id: "super_admin", title: "مدير عام (Super Admin)", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "sales_manager", title: "مدير المبيعات", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "content_editor", title: "محرر محتوى المعرض", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "support", title: "الدعم الفني والخدمة", badge: "bg-slate-100 text-slate-700 border-slate-200" },
];

export default function TeamAndPermissionsPage() {
  const [activeTab, setActiveTab] = useState<"users" | "matrix">("users");
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<TeamMember["role"]>("content_editor");

  // Permission Matrix state
  const [matrix, setMatrix] = useState<Record<string, { read: boolean; write: boolean; delete: boolean }>>({
    "السيارات الفاخرة": { read: true, write: true, delete: true },
    "السكوترات": { read: true, write: true, delete: false },
    "العقارات والأبراج": { read: true, write: true, delete: true },
    "الطلبات والعملاء": { read: true, write: true, delete: false },
    "التقارير المالية": { read: true, write: false, delete: false },
    "إعدادات المنظومة": { read: true, write: true, delete: true },
  });

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const user: TeamMember = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    };

    setMembers([user, ...members]);
    setIsAddUserOpen(false);
    setNewUserName("");
    setNewUserEmail("");
  };

  const togglePermission = (module: string, perm: "read" | "write" | "delete") => {
    setMatrix((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [perm]: !prev[module]?.[perm],
      },
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            فريق العمل والصلاحيات 👥
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة أعضاء الفريق، توزيع الأدوار، وضبط مصفوفة الصلاحيات (Permissions Matrix)
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة عضو جديد</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-sm transition-all ${
            activeTab === "users"
              ? "bg-white border-x border-t border-slate-200/80 text-amber-600 border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>قائمة الأعضاء ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-sm transition-all ${
            activeTab === "matrix"
              ? "bg-white border-x border-t border-slate-200/80 text-amber-600 border-b-2 border-b-white -mb-px shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>مصفوفة الصلاحيات (Roles & Permissions)</span>
        </button>
      </div>

      {activeTab === "users" ? (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative sm:col-span-2">
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث باسم العضو أو البريد الإلكتروني..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع الأدوار</option>
                <option value="super_admin">مدير عام</option>
                <option value="sales_manager">مدير المبيعات</option>
                <option value="content_editor">محرر المحتوى</option>
                <option value="support">الدعم الفني</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">العضو</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الدور الوظيفي</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">تاريخ الانضمام</th>
                    <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => {
                    const roleInfo = rolesList.find((r) => r.id === m.role);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                            <div>
                              <span className="font-extrabold text-slate-900 block">{m.name}</span>
                              <span className="text-xs text-slate-400 font-mono">{m.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${roleInfo?.badge}`}>
                            {roleInfo?.title}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${m.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${m.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {m.status === "active" ? "نشط" : "غير نشط"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 font-mono">{m.joinedDate}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Permission Matrix View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base">مصفوفة التحكم بالصلاحيات (Permissions Matrix)</h3>
            <p className="text-xs text-slate-500 mt-1">تحديد صلاحيات العرض، التعديل، والحذف لكل قسم في لوحة التحكم</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-600 uppercase">الوحدة / القسم</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-600 uppercase text-center">عرض (Read)</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-600 uppercase text-center">إضافة وتعديل (Write)</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-600 uppercase text-center">حذف (Delete)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modulesList.map((module) => {
                  const perms = matrix[module] || { read: false, write: false, delete: false };
                  return (
                    <tr key={module} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-bold text-slate-800">{module}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => togglePermission(module, "read")}
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${perms.read ? "bg-amber-500 text-white shadow-xs" : "bg-slate-100 text-slate-300"}`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => togglePermission(module, "write")}
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${perms.write ? "bg-amber-500 text-white shadow-xs" : "bg-slate-100 text-slate-300"}`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => togglePermission(module, "delete")}
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${perms.delete ? "bg-amber-500 text-white shadow-xs" : "bg-slate-100 text-slate-300"}`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                إضافة عضو فريق جديد
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">الاسم الكامل *</label>
                <input
                  type="text"
                  placeholder="مثال: علي المنصوري"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني *</label>
                <input
                  type="email"
                  placeholder="ali@elomda.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">الدور الوظيفي *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="super_admin">مدير عام (Super Admin)</option>
                  <option value="sales_manager">مدير المبيعات</option>
                  <option value="content_editor">محرر المحتوى</option>
                  <option value="support">الدعم الفني</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-md">
                  إضافة العضو
                </button>
                <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
