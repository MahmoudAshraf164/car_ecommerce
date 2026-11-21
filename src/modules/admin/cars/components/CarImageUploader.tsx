"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImageIcon, Star, Trash2, Plus, UploadCloud } from "lucide-react";
import { CarImageRow } from "../types/car.types";

export interface NewFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface CarImageUploaderProps {
  existingImages: CarImageRow[];
  newFiles: NewFileItem[];
  primaryImageKey: string;
  isUploading?: boolean;
  onSelectFiles: (files: File[]) => void;
  onRemoveExisting: (id: string) => void;
  onRemoveNewFile: (id: string) => void;
  onSetPrimary: (key: string) => void;
}

export function CarImageUploader({
  existingImages,
  newFiles,
  primaryImageKey,
  isUploading = false,
  onSelectFiles,
  onRemoveExisting,
  onRemoveNewFile,
  onSetPrimary,
}: CarImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onSelectFiles(files);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const totalImagesCount = existingImages.length + newFiles.length;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#C59B27]" />
          <span>صور السيارة</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {totalImagesCount}
          </span>
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          اختر صورة واحدة لتكون الرئيسية
        </span>
      </div>

      {/* Upload Zone */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="car-images-input"
        />
        <label
          htmlFor="car-images-input"
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-[#C59B27] bg-slate-50 hover:bg-[#C59B27]/5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-[#C59B27]/10 flex items-center justify-center text-[#C59B27] mb-2 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            اضغط لاختيار صور من جهازك
          </span>
          <span className="text-xs text-slate-400 mt-1">
            يمكنك رفع عدة صور دفعة واحدة (JPG, PNG, WebP)
          </span>
        </label>
      </div>

      {/* Image Gallery Grid */}
      {totalImagesCount === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          لا توجد صور مضافة لهذه السيارة حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Existing Saved Images */}
          {existingImages.map((img) => {
            const key = `existing-${img.id}`;
            const isPrimary = primaryImageKey === key;
            const imgUrl = img.image_url || "/placeholder-car.jpg";

            return (
              <div
                key={key}
                className={`relative group rounded-xl overflow-hidden border bg-slate-100 aspect-video transition-all ${
                  isPrimary
                    ? "border-[#C59B27] ring-2 ring-[#C59B27]/40 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
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

                {/* Primary Badge - Only for the Single Primary Image */}
                {isPrimary && (
                  <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#C59B27] text-[10px] font-black text-slate-950 shadow-md flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-slate-950" />
                    الرئيسية
                  </span>
                )}

                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity p-2 z-20">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimary(key)}
                      className="px-2.5 py-1.5 bg-[#C59B27] hover:bg-[#b08820] text-slate-950 text-xs font-bold rounded-lg transition-transform hover:scale-105 flex items-center gap-1 shadow-sm"
                      title="تعيين كصورة رئيسية"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>تعيين كرئيسية</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(img.id)}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-transform hover:scale-105 shadow-sm"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Newly Selected Files (Not Yet Uploaded) */}
          {newFiles.map((item) => {
            const key = `new-${item.id}`;
            const isPrimary = primaryImageKey === key;

            return (
              <div
                key={key}
                className={`relative group rounded-xl overflow-hidden border bg-slate-100 aspect-video transition-all ${
                  isPrimary
                    ? "border-[#C59B27] ring-2 ring-[#C59B27]/40 shadow-sm"
                    : "border-dashed border-amber-300 hover:border-amber-400"
                }`}
              >
                <Image
                  src={item.previewUrl}
                  alt="New Upload Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Indicator tag for new unsaved image */}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[9px] font-bold text-white z-10">
                  صورة جديدة
                </span>

                {/* Primary Badge */}
                {isPrimary && (
                  <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-[#C59B27] text-[10px] font-black text-slate-950 shadow-md flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-slate-950" />
                    الرئيسية
                  </span>
                )}

                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity p-2 z-20">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimary(key)}
                      className="px-2.5 py-1.5 bg-[#C59B27] hover:bg-[#b08820] text-slate-950 text-xs font-bold rounded-lg transition-transform hover:scale-105 flex items-center gap-1 shadow-sm"
                      title="تعيين كصورة رئيسية"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>تعيين كرئيسية</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveNewFile(item.id)}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-transform hover:scale-105 shadow-sm"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-4 h-4" />
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
