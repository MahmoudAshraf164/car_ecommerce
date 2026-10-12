"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createProtectionFilm, updateProtectionFilm } from "../actions/protection-films-admin";
import { createBrowserClient } from "@supabase/ssr";

interface ProtectionFilmModalProps {
  isOpen: boolean;
  onClose: () => void;
  filmToEdit?: any;
  onSuccess: () => void;
}

export function ProtectionFilmModal({ isOpen, onClose, filmToEdit, onSuccess }: ProtectionFilmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: filmToEdit?.title || "",
    film_type: filmToEdit?.film_type || "ppf",
    warranty_years: filmToEdit?.warranty_years ?? "",
    price_starting_from: (filmToEdit?.price || filmToEdit?.price_starting_from) ?? "",
    description: filmToEdit?.description || "",
  });
  const [imageUrl, setImageUrl] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `films/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (error: any) {
      console.error("Error uploading film image:", error);
      alert(`حدث خطأ أثناء رفع الصورة: ${error?.message || "خطأ غير معروف"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      warranty_years: Number(formData.warranty_years) || 0,
      price: Number(formData.price_starting_from) || 0,
      price_starting_from: Number(formData.price_starting_from) || 0,
      slug: generateSlug(formData.title),
      brand: "العامة",
      features: "[]",
    };

    let res;
    if (filmToEdit) {
      res = await updateProtectionFilm(filmToEdit.id, payload, imageUrl);
    } else {
      res = await createProtectionFilm(payload, imageUrl);
    }

    setIsSubmitting(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      alert(res.error || "حدث خطأ");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">{filmToEdit ? "تعديل الباقة" : "إضافة باقة جديدة"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">الاسم</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">النوع</label>
              <select value={formData.film_type} onChange={e => setFormData({...formData, film_type: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="ppf">PPF</option>
                <option value="ceramic">نانو سيراميك</option>
                <option value="package">باقة شاملة</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">سنوات الضمان</label>
              <input type="number" value={formData.warranty_years ?? ''} onChange={e => setFormData({...formData, warranty_years: e.target.value === '' ? '' : (parseInt(e.target.value) || 0)})} className="w-full border rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">السعر (ج.م)</label>
              <input type="number" value={formData.price_starting_from ?? ''} onChange={e => setFormData({...formData, price_starting_from: e.target.value === '' ? '' : (parseFloat(e.target.value) || 0)})} className="w-full border rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">الوصف</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">صورة الباقة</label>
            <div className="flex items-center gap-4">
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="text-sm" />
              {isUploading && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
              {imageUrl && <img src={imageUrl} alt="Preview" className="h-12 w-12 object-cover rounded" />}
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">إلغاء</button>
            <button type="submit" disabled={isSubmitting || isUploading} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
              ) : (
                "حفظ"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
