"use client";

import React, { useState } from "react";
import { Search, Save, X, Check, Image as ImageIcon, AlertCircle } from "lucide-react";
import productsData from "@/data/products.json";

const checkHasValidImages = (product: any) => {
  return Array.isArray(product?.images) &&
    product.images.some(
      (img: any) =>
        img &&
        typeof img === "string" &&
        img.trim() !== "" &&
        !img.includes("placeholder")
    );
};

export default function ImagePicker() {
  const savedProductsCount = productsData.filter(checkHasValidImages).length;
  const [query, setQuery] = useState("");
  const [productId, setProductId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchImages = async () => {
    const res = await fetch(`/api/images?q=${query}`);
    const data = await res.json();
    setImages(data.images || []);
  };

  const toggleSelection = (url: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(url)) {
        return prev.filter((img) => img !== url);
      } else {
        if (prev.length >= 4) {
          setError("You can only select up to 4 images.");
          return prev;
        }
        setError("");
        return [...prev, url];
      }
    });
  };

  const saveSelectedImages = async () => {
    if (selectedImages.length < 1 || selectedImages.length > 4) {
      setError("Please select between 1 and 4 images.");
      return;
    }

    if (!productId) {
      setError("Please select a product to update.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // 1. Download images locally
      const saveRes = await fetch("/api/save-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: query || productId,
          images: selectedImages
        })
      });

      const saveData = await saveRes.json();

      if (!saveData.success) {
        throw new Error("Failed to download and save images locally");
      }

      console.log("Saved images:", saveData.images);

      // 2. Update product data with local image paths
      const updateRes = await fetch("/api/update-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, images: saveData.images })
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update product database");
      }

      setSuccess(`Successfully saved ${saveData.images.length} local images to product!`);
      setSelectedImages([]);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to save selected images");
    } finally {
      setIsSaving(false);
    }
  };

  const missingCount = productsData.filter(p => !checkHasValidImages(p)).length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ImageIcon className="text-brand-orange" size={32} />
            Image Picker
          </h1>
          <p className="text-gray-500 mt-2">Manually select and save product images.</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium text-sm border border-green-100">
            Saved: <span className="font-bold text-lg">{savedProductsCount}</span>/{productsData.length}
          </span>
          {missingCount > 0 && (
            <a
              href="/auto-image-picker"
              className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#ff943d] transition-colors shadow-sm"
            >
              ⚡ Auto Fill {missingCount} Missing Images
            </a>
          )}
          <span className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm border border-blue-100">
            Selected: <span className="font-bold text-lg">{selectedImages.length}</span>/4
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
              Select Product to Update
              {productId && (() => {
                const p = productsData.find(prod => prod.id === productId);
                const hasValidImages = checkHasValidImages(p);
                return hasValidImages ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Check size={12} /> {p?.images?.length || 0} Images Saved
                  </span>
                ) : null;
              })()}
            </label>
            <select 
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const prod = productsData.find(p => p.id === e.target.value);
                if (prod) {
                  setQuery(prod.name);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
            >
              <option value="">-- Choose a Product --</option>
              {/* Sort products alphabetically */}
              {[...productsData].sort((a, b) => a.name.localeCompare(b.name)).map((p: any) => {
                const hasValidImages = checkHasValidImages(p);
                return (
                  <option key={p.id} value={p.id}>
                    {hasValidImages ? "✅ " : ""}
                    {p.name}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="E.g., Arduino Uno..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchImages()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={fetchImages}
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3 bg-brand-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex justify-center items-center disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Generate Images"
            )}
          </button>
          
          <button
            onClick={saveSelectedImages}
            disabled={selectedImages.length < 2 || isSaving}
            className="w-full sm:w-auto px-8 py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-[#ff943d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Save size={18} /> Save Selected Images</>
            )}
          </button>

          {selectedImages.length > 0 && (
            <button
              onClick={() => setSelectedImages([])}
              className="w-full sm:w-auto px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
            >
              <X size={18} /> Clear
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 text-green-600 p-4 rounded-xl border border-green-100 flex items-start gap-3">
            <Check size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url, idx) => {
              const isSelected = selectedImages.includes(url);
              return (
                <div 
                  key={idx}
                  onClick={() => toggleSelection(url)}
                  className={`relative aspect-square cursor-pointer rounded-2xl overflow-hidden border-4 transition-all duration-200 ${
                    isSelected 
                      ? 'border-brand-orange shadow-lg scale-[0.98]' 
                      : 'border-transparent hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <img 
                    src={url} 
                    alt={`Generated ${idx + 1}`} 
                    className="w-full h-full object-cover bg-gray-100"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.png";
                      e.currentTarget.onerror = null;
                    }}
                  />
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-brand-orange/20 flex items-start justify-end p-2">
                      <div className="bg-brand-orange text-white rounded-full p-1 shadow-md">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 min-h-[300px] flex flex-col items-center justify-center text-center p-8">
            <ImageIcon size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-400 mb-2">No Images Displayed</h3>
            <p className="text-gray-500">Enter a product name and generate images instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
