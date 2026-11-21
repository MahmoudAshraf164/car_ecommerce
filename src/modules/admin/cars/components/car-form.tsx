"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBrowserClient } from "@supabase/ssr";
import { carFormSchema, CarFormValues } from "../validations/car.schema";
import { CarWithRelations, FeatureRow, CarImageRow } from "../types/car.types";
import { createCar, getBrands, getModelsByBrand, seedCarsData } from "../actions/cars";
import { CarBrandModelSelect } from "./CarBrandModelSelect";
import { CarImageUploader, NewFileItem } from "./CarImageUploader";
import { 
  Car, 
  CheckCircle2, 
  ListChecks, 
  Loader2,
  AlertCircle
} from "lucide-react";

interface CarFormProps {
  initialCar?: CarWithRelations | null;
  brands?: any[];
  featuresList?: FeatureRow[];
}

export function CarForm({ initialCar, brands: initialBrands = [], featuresList = [] }: CarFormProps) {
  const router = useRouter();
  const [brandsList, setBrandsList] = useState<any[]>(initialBrands);
  const [modelsList, setModelsList] = useState<any[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ─── Image State Management ─────────────────────────────────────────────────
  // 1. Existing saved images loaded ordered by display_order, created_at
  const [existingImages, setExistingImages] = useState<CarImageRow[]>(() => {
    const sorted = [...(initialCar?.car_images || [])];
    sorted.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return sorted;
  });

  // 2. Removed image IDs (to be deleted from Supabase)
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  // 3. Newly selected File objects with preview URLs
  const [newFiles, setNewFiles] = useState<NewFileItem[]>([]);

  // 4. Key for the single primary image ('existing-{id}' or 'new-{id}')
  const [primaryImageKey, setPrimaryImageKey] = useState<string>(() => {
    const existing = initialCar?.car_images || [];
    const primaryImg = existing.find((img) => img.is_primary) || existing[0];
    return primaryImg ? `existing-${primaryImg.id}` : "";
  });

  const defaultValues: Partial<CarFormValues> = {
    title: initialCar?.title || "",
    slug: initialCar?.slug || "",
    brand_id: initialCar?.brand_id || (initialCar?.brand?.name || ""),
    model_id: initialCar?.model_id || (initialCar?.car_models?.name || ""),
    year: initialCar?.year || new Date().getFullYear(),
    price: initialCar?.price || 0,
    condition: (initialCar?.condition as any) || "used",
    transmission: (initialCar?.transmission as any) || "automatic",
    fuel_type: (initialCar?.fuel_type as any) || "petrol",
    drive_type: (initialCar?.drive_type as any) || "fwd",
    body_type: (initialCar?.body_type as any) || "sedan",
    mileage: initialCar?.mileage || 0,
    engine_capacity: initialCar?.engine_capacity || 1600,
    color: initialCar?.color || "",
    status: (initialCar?.status as any) || "available",
    featured: initialCar?.featured || false,
    description: initialCar?.description || "",
    features: initialCar?.features?.map((f) => f.id) || [],
    extra_specs: [],
    images: [],
  };

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema) as any,
    defaultValues,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const selectedBrandId = watch("brand_id");

  // Load brands on mount if empty
  useEffect(() => {
    async function loadInitialBrands() {
      if (brandsList.length === 0) {
        setIsLoadingBrands(true);
        const { data } = await getBrands();
        if (data && data.length > 0) {
          setBrandsList(data);
        }
        setIsLoadingBrands(false);
      }
    }
    loadInitialBrands();
  }, [brandsList.length]);

  // Load models whenever selectedBrandId changes
  useEffect(() => {
    async function fetchModels() {
      if (!selectedBrandId || selectedBrandId.trim() === "") {
        setModelsList([]);
        return;
      }
      setIsLoadingModels(true);

      const matchedBrand = brandsList.find(
        (b) => b.id === selectedBrandId || b.name?.toLowerCase() === selectedBrandId?.toLowerCase()
      );

      if (matchedBrand) {
        if (matchedBrand.car_models && matchedBrand.car_models.length > 0) {
          setModelsList(matchedBrand.car_models);
          setIsLoadingModels(false);
          return;
        }
        const { data } = await getModelsByBrand(matchedBrand.id);
        setModelsList(data || []);
      } else {
        const { data } = await getModelsByBrand(selectedBrandId);
        setModelsList(data || []);
      }
      setIsLoadingModels(false);
    }

    fetchModels();
  }, [selectedBrandId, brandsList]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [newFiles]);

  // Ensure there is always a primary image if images exist
  useEffect(() => {
    const allKeys = [
      ...existingImages.map((img) => `existing-${img.id}`),
      ...newFiles.map((item) => `new-${item.id}`),
    ];
    if (allKeys.length > 0 && (!primaryImageKey || !allKeys.includes(primaryImageKey))) {
      setPrimaryImageKey(allKeys[0]);
    } else if (allKeys.length === 0) {
      setPrimaryImageKey("");
    }
  }, [existingImages, newFiles, primaryImageKey]);

  // Handle selecting new files from input
  const handleSelectFiles = (files: File[]) => {
    const items: NewFileItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewFiles((prev) => {
      const next = [...prev, ...items];
      if (!primaryImageKey && existingImages.length === 0 && items.length > 0) {
        setPrimaryImageKey(`new-${items[0].id}`);
      }
      return next;
    });
  };

  // Handle removing an existing saved image
  const handleRemoveExisting = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);

    if (primaryImageKey === `existing-${id}`) {
      const remainingExisting = existingImages.filter((img) => img.id !== id);
      if (remainingExisting.length > 0) {
        setPrimaryImageKey(`existing-${remainingExisting[0].id}`);
      } else if (newFiles.length > 0) {
        setPrimaryImageKey(`new-${newFiles[0].id}`);
      } else {
        setPrimaryImageKey("");
      }
    }
  };

  // Handle removing an unsaved new file
  const handleRemoveNewFile = (id: string) => {
    const itemToRemove = newFiles.find((item) => item.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }
    setNewFiles((prev) => prev.filter((item) => item.id !== id));

    if (primaryImageKey === `new-${id}`) {
      const remainingNew = newFiles.filter((item) => item.id !== id);
      if (existingImages.length > 0) {
        setPrimaryImageKey(`existing-${existingImages[0].id}`);
      } else if (remainingNew.length > 0) {
        setPrimaryImageKey(`new-${remainingNew[0].id}`);
      } else {
        setPrimaryImageKey("");
      }
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    await seedCarsData(false);
    const { data } = await getBrands();
    if (data) setBrandsList(data);
    setIsSeeding(false);
  };

  // ─── Submit Handler ──────────────────────────────────────────────────────────
  const onSubmit = async (data: CarFormValues) => {
    if (!data.brand_id || data.brand_id.trim() === "") {
      setErrorMsg("يرجى اختيار الماركة أولاً");
      return;
    }
    if (!data.model_id || data.model_id.trim() === "") {
      setErrorMsg("يرجى اختيار الموديل التابع للماركة");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      if (initialCar) {
        const carId = initialCar.id;

        // 1. Update cars row using only valid columns
        const updatePayload: Record<string, any> = {
          title: data.title,
          slug: data.slug && data.slug.trim() !== "" ? data.slug : undefined,
          brand_id: data.brand_id,
          model_id: data.model_id,
          year: Number(data.year),
          price: Number(data.price),
          condition: data.condition,
          transmission: data.transmission,
          fuel_type: data.fuel_type,
          drive_type: data.drive_type,
          body_type: data.body_type,
          mileage: Number(data.mileage),
          engine_capacity: data.engine_capacity ? Number(data.engine_capacity) : null,
          color: data.color || null,
          status: data.status,
          featured: data.featured,
          description: data.description || null,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("cars")
          .update(updatePayload)
          .eq("id", carId);

        if (updateError) {
          throw updateError;
        }

        // 2. Delete removed images from car_images
        if (removedImageIds.length > 0) {
          const { error: delError } = await supabase
            .from("car_images")
            .delete()
            .in("id", removedImageIds);
          if (delError) {
            throw delError;
          }
        }

        // 3. Upload new files to Supabase Storage & insert to car_images
        const uploadedNewRows: { image_url: string; newKey: string }[] = [];
        if (newFiles.length > 0) {
          for (let index = 0; index < newFiles.length; index++) {
            const item = newFiles[index];
            const file = item.file;
            const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const filePath = `cars/${carId}/${Date.now()}-${index}-${sanitizedName}`;

            const { error: uploadError } = await supabase.storage
              .from("uploads")
              .upload(filePath, file, { upsert: false });

            if (uploadError) {
              console.error("Storage upload error:", uploadError);
              throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(filePath);

            uploadedNewRows.push({
              image_url: publicUrlData.publicUrl,
              newKey: `new-${item.id}`,
            });
          }
        }

        // 4. Normalize display_order and enforce single is_primary: true
        // Combine kept existing images + newly uploaded rows
        type ImageFinalItem = {
          id?: string;
          image_url: string;
          isPrimary: boolean;
        };

        const finalImagesList: ImageFinalItem[] = [
          ...existingImages.map((img) => ({
            id: img.id,
            image_url: img.image_url,
            isPrimary: primaryImageKey === `existing-${img.id}`,
          })),
          ...uploadedNewRows.map((item) => ({
            image_url: item.image_url,
            isPrimary: primaryImageKey === item.newKey,
          })),
        ];

        // Ensure at least one image is primary if any images exist
        const hasPrimary = finalImagesList.some((item) => item.isPrimary);
        if (!hasPrimary && finalImagesList.length > 0) {
          finalImagesList[0].isPrimary = true;
        }

        // Update existing images display_order & is_primary
        for (let idx = 0; idx < finalImagesList.length; idx++) {
          const item = finalImagesList[idx];
          if (item.id) {
            const { error: updateImgErr } = await supabase
              .from("car_images")
              .update({
                display_order: idx,
                is_primary: item.isPrimary,
              })
              .eq("id", item.id);
            if (updateImgErr) {
              console.error("Error updating image order:", updateImgErr);
            }
          } else {
            // Insert newly uploaded image
            const { error: insertImgErr } = await supabase
              .from("car_images")
              .insert({
                car_id: carId,
                image_url: item.image_url,
                display_order: idx,
                is_primary: item.isPrimary,
              });
            if (insertImgErr) {
              console.error("Error inserting car image:", insertImgErr);
              throw insertImgErr;
            }
          }
        }

        // 5. Update car_features
        if (data.features) {
          await supabase.from("car_features").delete().eq("car_id", carId);
          if (data.features.length > 0) {
            const featureInserts = data.features.map((feature_id) => ({
              car_id: carId,
              feature_id,
            }));
            await supabase.from("car_features").insert(featureInserts);
          }
        }

        // 6. Clear removedImageIds & newFiles, re-fetch fresh car + car_images from Supabase
        setRemovedImageIds([]);
        newFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setNewFiles([]);

        const { data: freshImages } = await supabase
          .from("car_images")
          .select("*")
          .eq("car_id", carId)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (freshImages) {
          setExistingImages(freshImages as CarImageRow[]);
          const freshPrimary = freshImages.find((img) => img.is_primary) || freshImages[0];
          setPrimaryImageKey(freshPrimary ? `existing-${freshPrimary.id}` : "");
        }

        router.refresh();
        router.push("/admin/cars");
      } else {
        // Create new car flow
        const res = await createCar(data);
        if (res.success && res.carId) {
          // If any newFiles were selected in new car form, upload them
          if (newFiles.length > 0) {
            for (let index = 0; index < newFiles.length; index++) {
              const item = newFiles[index];
              const file = item.file;
              const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
              const filePath = `cars/${res.carId}/${Date.now()}-${index}-${sanitizedName}`;

              await supabase.storage.from("uploads").upload(filePath, file);
              const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filePath);

              const isPrimary = primaryImageKey === `new-${item.id}` || index === 0;
              await supabase.from("car_images").insert({
                car_id: res.carId,
                image_url: urlData.publicUrl,
                display_order: index,
                is_primary: isPrimary,
              });
            }
          }
          router.push("/admin/cars");
          router.refresh();
        } else {
          setErrorMsg(typeof res.error === "string" ? res.error : "حدث خطأ أثناء حفظ البيانات");
        }
      }
    } catch (err: any) {
      console.error("Error saving car:", err);
      setErrorMsg(err?.message || "حدث خطأ أثناء حفظ السيارة وتحديث الصور");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto space-y-6 text-right font-sans" dir="rtl">
      {/* Top Header Card - Luxurious Black & Gold */}
      <div className="bg-[#111111] p-6 rounded-2xl border border-neutral-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#C59B27]/15 text-[#C59B27] border border-[#C59B27]/30">
              <Car className="w-6 h-6" />
            </div>
            <span>{initialCar ? "تعديل تفاصيل السيارة" : "إضافة سيارة جديدة"}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {initialCar ? `تعديل بيانات: ${initialCar.title}` : "قم بملء بيانات السيارة والفرع لإتاحتها بالمعرض"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 font-semibold text-sm transition-colors border border-neutral-800"
          >
            إلغاء
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b08820] active:bg-[#99751a] text-slate-950 font-bold text-sm transition-all shadow-md shadow-[#C59B27]/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {initialCar ? "حفظ التغييرات" : "إضافة السيارة"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* No Brands Empty State Banner */}
      {brandsList.length === 0 && !isLoadingBrands && (
        <div className="p-4 rounded-xl bg-[#C59B27]/10 border border-[#C59B27]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#C59B27] shrink-0" />
            <span>لا توجد ماركات مسجلة في قاعدة البيانات حالياً. يمكنك توليد الماركات الأساسية بضغطة زر.</span>
          </div>
          <button
            type="button"
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-4 py-2 bg-[#C59B27] text-slate-950 font-bold text-xs rounded-lg hover:bg-[#b08820] transition-colors shrink-0 disabled:opacity-50"
          >
            {isSeeding ? "جاري التوليد..." : "توليد ماركات وموديلات افتراضية"}
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Primary Info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Car className="w-5 h-5 text-[#C59B27]" />
                البيانات الأساسية والتعريفية
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">
                    عنوان الإعلان <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مرسيدس بنز S500 موديل 2024 بحالة الزيرو"
                    {...register("title")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                  {errors.title && (
                    <p className="text-rose-500 text-xs font-medium">{errors.title.message}</p>
                  )}
                </div>

                {/* Brand & Model Select */}
                <CarBrandModelSelect
                  initialBrands={brandsList}
                  selectedBrandId={selectedBrandId}
                  selectedModelId={watch("model_id")}
                  onBrandChange={(val: string) => {
                    setValue("brand_id", val, { shouldValidate: true });
                    setValue("model_id", "", { shouldValidate: true });
                  }}
                  onModelChange={(val: string) => setValue("model_id", val, { shouldValidate: true })}
                  brandError={errors.brand_id?.message}
                  modelError={errors.model_id?.message}
                />

                {/* Year */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    سنة الصنع <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("year", { valueAsNumber: true })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                  {errors.year && (
                    <p className="text-rose-500 text-xs font-medium">{errors.year.message}</p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    السعر المطلوب (ج.م) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    {...register("price", { valueAsNumber: true })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                  {errors.price && (
                    <p className="text-rose-500 text-xs font-medium">{errors.price.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Specs & Specifications */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                المواصفات الفنية والميكانيكية
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Condition */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">حالة السيارة</label>
                  <select
                    {...register("condition")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="new">زيرو / جديدة (New)</option>
                    <option value="used">مستعملة معتمدة (Used)</option>
                  </select>
                </div>

                {/* Transmission */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">ناقل الحركة</label>
                  <select
                    {...register("transmission")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="automatic">أوتوماتيك (Automatic)</option>
                    <option value="manual">يدوي / مانيوال (Manual)</option>
                    <option value="cvt">CVT</option>
                    <option value="dual_clutch">دبل كلتش (Dual-Clutch)</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">نوع الوقود</label>
                  <select
                    {...register("fuel_type")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="petrol">بنزين (Petrol)</option>
                    <option value="diesel">ديزل (Diesel)</option>
                    <option value="electric">كهرباء بالكامل (Electric)</option>
                    <option value="hybrid">هايبرد (Hybrid)</option>
                    <option value="plugin_hybrid">هايبرد قابل للشحن (Plug-in Hybrid)</option>
                    <option value="gas">غاز طبيعي (Natural Gas)</option>
                  </select>
                </div>

                {/* Drive Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">نظام الدفع</label>
                  <select
                    {...register("drive_type")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="fwd">جر أمامي (FWD)</option>
                    <option value="rwd">دفع خلفي (RWD)</option>
                    <option value="awd">دفع كلي مستمر (AWD)</option>
                    <option value="4wd">دفع رباعي (4WD / 4x4)</option>
                  </select>
                </div>

                {/* Body Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">نمط الهيكل</label>
                  <select
                    {...register("body_type")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="sedan">سيدان</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">هاتشباك</option>
                    <option value="coupe">كوبيه</option>
                    <option value="convertible">كابريوليه</option>
                    <option value="van">فان</option>
                    <option value="truck">بيك أب</option>
                    <option value="crossover">كروس أوفر</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                {/* Mileage */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">الكيلومترات (كم)</label>
                  <input
                    type="number"
                    {...register("mileage", { valueAsNumber: true })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                </div>

                {/* Engine Capacity */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">سعة المحرك (سي سي)</label>
                  <input
                    type="number"
                    placeholder="مثال: 1600"
                    {...register("engine_capacity")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                </div>

                {/* Color */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">اللون الخارجي</label>
                  <input
                    type="text"
                    placeholder="مثال: أسود ميتاليك / أبيض لؤلؤي"
                    {...register("color")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">الوصف الكامل والملاحظات</label>
                <textarea
                  rows={4}
                  placeholder="اكتب وصفاً مفصلاً عن حالة السيارة، الضمان، وملاحظات الصيانات..."
                  {...register("description")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                />
              </div>
            </div>

            {/* Card 3: Features & Equipment */}
            {featuresList.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ListChecks className="w-5 h-5 text-[#C59B27]" />
                  المميزات والتجهيزات (Features)
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {featuresList.map((feature) => {
                    const currentFeatures = watch("features") || [];
                    const isChecked = currentFeatures.includes(feature.id);

                    return (
                      <label
                        key={feature.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                          isChecked
                            ? "bg-[#C59B27]/10 border-[#C59B27]/50 text-slate-900 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setValue("features", [...currentFeatures, feature.id]);
                            } else {
                              setValue(
                                "features",
                                currentFeatures.filter((id) => id !== feature.id)
                              );
                            }
                          }}
                          className="hidden"
                        />
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? "bg-[#C59B27] border-[#C59B27] text-slate-950" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{feature.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Settings Column (1 col) */}
          <div className="space-y-6">
            {/* Card 4: Listing Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                حالة العرض والتمييز
              </h2>

              <div className="space-y-4">
                {/* Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">حالة الإعلان بالمعرض</label>
                  <select
                    {...register("status")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="available">متاحة بالمعرض (Available)</option>
                    <option value="reserved">محجوزة (Reserved)</option>
                    <option value="sold">مباعة (Sold)</option>
                    <option value="draft">مسودة (Draft)</option>
                    <option value="archived">أرشيف (Archived)</option>
                  </select>
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300 transition-all">
                  <input
                    type="checkbox"
                    {...register("featured")}
                    className="w-4 h-4 accent-[#C59B27] rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">سيارة مميزة (Featured)</span>
                    <span className="text-[11px] text-slate-500 block">تظهر بالصفحة الرئيسية بأول النتائج</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Card 5: Car Images */}
            <CarImageUploader
              existingImages={existingImages}
              newFiles={newFiles}
              primaryImageKey={primaryImageKey}
              isUploading={isSubmitting}
              onSelectFiles={handleSelectFiles}
              onRemoveExisting={handleRemoveExisting}
              onRemoveNewFile={handleRemoveNewFile}
              onSetPrimary={(key) => setPrimaryImageKey(key)}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
