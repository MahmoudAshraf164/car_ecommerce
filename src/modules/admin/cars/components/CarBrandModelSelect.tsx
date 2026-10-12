"use client";

import { useState, useEffect } from "react";
import { getBrands, getModelsByBrand } from "@/modules/admin/cars/actions/cars";
import { Loader2, Car, Layers } from "lucide-react";

interface CarBrandModelSelectProps {
  selectedBrandId?: string;
  selectedModelId?: string;
  onBrandChange?: (brandId: string) => void;
  onModelChange?: (modelId: string) => void;
  brandRegister?: any;
  modelRegister?: any;
  brandError?: string;
  modelError?: string;
  initialBrands?: any[];
}

export function CarBrandModelSelect({
  selectedBrandId = "",
  selectedModelId = "",
  onBrandChange,
  onModelChange,
  brandRegister,
  modelRegister,
  brandError,
  modelError,
  initialBrands = [],
}: CarBrandModelSelectProps) {
  const [brands, setBrands] = useState<any[]>(initialBrands);
  const [models, setModels] = useState<any[]>([]);
  const [currentBrandId, setCurrentBrandId] = useState<string>(selectedBrandId);
  const [currentModelId, setCurrentModelId] = useState<string>(selectedModelId);

  const [isLoadingBrands, setIsLoadingBrands] = useState<boolean>(false);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  // Sync internal state with props if provided
  useEffect(() => {
    if (selectedBrandId !== undefined) {
      setCurrentBrandId(selectedBrandId);
    }
  }, [selectedBrandId]);

  useEffect(() => {
    if (selectedModelId !== undefined) {
      setCurrentModelId(selectedModelId);
    }
  }, [selectedModelId]);

  // Load brands on mount if not provided via props
  useEffect(() => {
    async function loadBrands() {
      if (brands.length === 0) {
        setIsLoadingBrands(true);
        const { data } = await getBrands();
        if (data && data.length > 0) {
          setBrands(data);
        }
        setIsLoadingBrands(false);
      }
    }
    loadBrands();
  }, []);

  // Fetch models whenever currentBrandId changes
  useEffect(() => {
    async function loadModels() {
      if (!currentBrandId) {
        setModels([]);
        return;
      }

      setIsLoadingModels(true);
      const { data } = await getModelsByBrand(currentBrandId);
      setModels(data || []);
      setIsLoadingModels(false);
    }

    loadModels();
  }, [currentBrandId]);

  const handleBrandSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    setCurrentBrandId(brandId);
    setCurrentModelId("");

    if (onBrandChange) onBrandChange(brandId);
    if (onModelChange) onModelChange("");

    if (brandRegister?.onChange) {
      brandRegister.onChange(e);
    }
  };

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    setCurrentModelId(modelId);

    if (onModelChange) onModelChange(modelId);

    if (modelRegister?.onChange) {
      modelRegister.onChange(e);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" dir="rtl">
      {/* Brand Select Dropdown */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C59B27]" />
            الماركة (Brand) *
          </span>
          {isLoadingBrands && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#C59B27]">
              <Loader2 className="w-3 h-3 animate-spin" />
              جاري التحميل...
            </span>
          )}
        </label>

        <div className="relative">
          <select
            value={currentBrandId}
            {...(brandRegister || {})}
            onChange={handleBrandSelect}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all cursor-pointer"
          >
            <option value="">-- اختر الماركة --</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {brandError && <p className="text-xs font-semibold text-rose-600 mt-1">{brandError}</p>}
      </div>

      {/* Model Select Dropdown */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-[#C59B27]" />
            الموديل (Model) *
          </span>
          {isLoadingModels && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#C59B27]">
              <Loader2 className="w-3 h-3 animate-spin" />
              جاري جلب الموديلات...
            </span>
          )}
        </label>

        <div className="relative">
          <select
            value={currentModelId}
            {...(modelRegister || {})}
            onChange={handleModelSelect}
            disabled={!currentBrandId || isLoadingModels}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]/20 focus:border-[#C59B27] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">
              {!currentBrandId ? "-- اختر الماركة أولاً --" : "-- اختر الموديل --"}
            </option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {modelError && <p className="text-xs font-semibold text-rose-600 mt-1">{modelError}</p>}
      </div>
    </div>
  );
}
