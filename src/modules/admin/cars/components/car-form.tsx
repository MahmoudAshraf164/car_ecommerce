"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { carFormSchema, CarFormValues } from "../validations/car.schema";
import { CarWithRelations, FeatureRow } from "../types/car.types";
import { createCar, updateCar, getBrands, getModelsByBrand, seedCarsData } from "../actions/cars";
import { CarBrandModelSelect } from "./CarBrandModelSelect";
import { CarImageUploader } from "./CarImageUploader";
import { 
  Car, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle2, 
  Layers, 
  ListChecks, 
  Image as ImageIcon,
  Loader2,
  Sparkles,
  AlertCircle,
  X
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
    images: initialCar?.car_images?.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      display_order: img.display_order,
      is_primary: img.is_primary,
    })) || [],
  };

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema) as any,
    defaultValues,
  });

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = form;

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  });

  const { fields: extraSpecFields, append: appendExtraSpec, remove: removeExtraSpec } = useFieldArray({
    control,
    name: "extra_specs",
  });

  const selectedBrandId = watch("brand_id");
  const [imageUrlInput, setImageUrlInput] = useState("");

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
  }, []);

  // Load models whenever selectedBrandId changes
  useEffect(() => {
    async function fetchModels() {
      if (!selectedBrandId) {
        setModelsList([]);
        return;
      }
      setIsLoadingModels(true);

      // Check if selectedBrandId is a UUID or name
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
        // If user typed brand name or UUID
        const { data } = await getModelsByBrand(selectedBrandId);
        setModelsList(data || []);
      }
      setIsLoadingModels(false);
    }

    fetchModels();
  }, [selectedBrandId, brandsList]);

  const handleAddImage = (url: string) => {
    appendImage({
      image_url: url,
      display_order: imageFields.length,
      is_primary: imageFields.length === 0,
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    const currentImages = watch("images");
    const updated = currentImages.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    setValue("images", updated);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    await seedCarsData(false);
    const { data } = await getBrands();
    if (data) setBrandsList(data);
    setIsSeeding(false);
  };

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

    let res;
    if (initialCar) {
      res = await updateCar(initialCar.id, data);
    } else {
      res = await createCar(data);
    }

    setIsSubmitting(false);

    if (res.success) {
      router.push("/admin/cars");
      router.refresh();
    } else {
      setErrorMsg(typeof res.error === "string" ? res.error : "حدث خطأ أثناء حفظ البيانات");
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
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#C59B27] hover:bg-[#b08820] text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0 shadow-xs"
          >
            {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            توليد البيانات الأولية
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Basic Information */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#C59B27]" />
                  البيانات الأساسية
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">عنوان السيارة *</label>
                  <input
                    type="text"
                    placeholder="مثال: مرسيدس C200 AMG موديل 2024"
                    {...register("title")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                  {errors.title && <p className="text-xs font-semibold text-rose-600">{errors.title.message}</p>}
                </div>

                {/* Interactive Brand & Model Select Component */}
                <div className="sm:col-span-2">
                  <CarBrandModelSelect
                    selectedBrandId={watch("brand_id")}
                    selectedModelId={watch("model_id")}
                    onBrandChange={(brandId) => {
                      setValue("brand_id", brandId);
                      setValue("model_id", "");
                    }}
                    onModelChange={(modelId) => {
                      setValue("model_id", modelId);
                    }}
                    brandRegister={register("brand_id")}
                    modelRegister={register("model_id")}
                    brandError={errors.brand_id?.message}
                    modelError={errors.model_id?.message}
                    initialBrands={brandsList}
                  />
                </div>

                {/* Year */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">سنة الصنع *</label>
                  <input
                    type="number"
                    {...register("year", { valueAsNumber: true })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                  {errors.year && <p className="text-xs font-semibold text-rose-600">{errors.year.message}</p>}
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">السعر (ج.م) *</label>
                  <input
                    type="number"
                    step="1000"
                    {...register("price", { valueAsNumber: true })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  />
                  {errors.price && <p className="text-xs font-semibold text-rose-600">{errors.price.message}</p>}
                </div>
              </div>
            </div>

            {/* Card 2: Technical Specifications */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Car className="w-5 h-5 text-[#C59B27]" />
                المواصفات الفنية
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Condition */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">حالة السيارة</label>
                  <select
                    {...register("condition")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="new">جديدة (زيرو)</option>
                    <option value="used">مستعملة</option>
                  </select>
                </div>

                {/* Transmission */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">ناقل الحركة</label>
                  <select
                    {...register("transmission")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="automatic">أوتوماتيك</option>
                    <option value="manual">مانيوال</option>
                    <option value="cvt">CVT</option>
                    <option value="dual_clutch">دبل كلتش</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">نوع الوقود</label>
                  <select
                    {...register("fuel_type")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="petrol">بنزين</option>
                    <option value="diesel">ديزل</option>
                    <option value="electric">كهرباء</option>
                    <option value="hybrid">هايبرد</option>
                    <option value="plugin_hybrid">بلاغ إن هايبرد</option>
                    <option value="gas">غاز طبيعي</option>
                  </select>
                </div>

                {/* Drive Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">منظومة الدفع</label>
                  <select
                    {...register("drive_type")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all"
                  >
                    <option value="fwd">دفع أمامي (FWD)</option>
                    <option value="rwd">دفع خلفي (RWD)</option>
                    <option value="awd">دفع كلي (AWD)</option>
                    <option value="4wd">دفع رباعي (4WD)</option>
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
              images={watch("images")}
              onAddImage={handleAddImage}
              onRemoveImage={removeImage}
              onSetPrimaryImage={handleSetPrimaryImage}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
