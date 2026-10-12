"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon, Loader2, Star, Trash2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface CarImageUploaderProps {
  images: any[];
  onAddImage: (url: string) => void;
  onRemoveImage: (index: number) => void;
  onSetPrimaryImage: (index: number) => void;
}

export function CarImageUploader({
  images,
  onAddImage,
  onRemoveImage,
  onSetPrimaryImage,
}: CarImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

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
      const filePath = `cars/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
      onAddImage(data.publicUrl);
    } catch (error: any) {
      console.error("Error uploading car image:", error);
      alert(`حدث خطأ أثناء رفع الصورة: ${error?.message || "خطأ غير معروف"}`);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <ImageIcon className="w-5 h-5 text-[#C59B27]" />
        صور السيارة
      </h2>

      {/* Upload Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">رفع صورة من الجهاز</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#C59B27]/10 file:text-[#C59B27] hover:file:bg-[#C59B27]/20 disabled:opacity-60"
          />
          {isUploading && (
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الرفع...
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {images.map((img, index) => {
            const imgUrl = img.image_url || "/placeholder-car.jpg";
            const isPrimary = img.is_primary;

            return (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden border bg-slate-100 aspect-video ${
                  isPrimary ? "border-[#C59B27] ring-2 ring-[#C59B27]/20" : "border-slate-200"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt="Car Image"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-car.jpg";
                  }}
                />
                {/* Primary Badge */}
                {isPrimary && (
                  <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-[#C59B27] text-[10px] font-bold text-slate-950 shadow-xs">
                    الرئيسية
                  </span>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onSetPrimaryImage(index)}
                    title="جعلها الصورة الرئيسية"
                    className="p-1.5 bg-[#C59B27] text-slate-950 rounded-lg hover:scale-105 transition-transform"
                  >
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    title="حذف الصورة"
                    className="p-1.5 bg-rose-600 text-white rounded-lg hover:scale-105 transition-transform"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


