import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import {
  CanonicalProduct,
  DestinationMetadata,
  MarketplaceDestination,
  ValidationResult,
} from '../../types/marketplace';
import { marketplaceApi, productsApi } from '../../services/api';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  Sparkles,
  Package,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ExportPreviewModal } from './ExportPreviewModal';

interface MarketplaceExportViewProps {
  onNavigateToProducts: () => void;
}

export const MarketplaceExportView: React.FC<MarketplaceExportViewProps> = ({
  onNavigateToProducts,
}) => {
  const [destinations, setDestinations] = useState<DestinationMetadata[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<MarketplaceDestination>('amazon');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [readinessData, setReadinessData] = useState<{
    readyProductsCount: number;
    unreadyProductsCount: number;
    results: { productId: string; productTitle: string; validation: ValidationResult }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load destinations and user products
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [destRes, prodRes] = await Promise.all([
        marketplaceApi.getDestinations().catch(() => ({ destinations: [] })),
        productsApi.getAll().catch(() => ({ products: [] })),
      ]);

      setDestinations(destRes.destinations || []);
      const prods = prodRes.products || [];
      setProducts(prods);

      // Select all products by default if available
      const ids = prods.map((p: Product) => p.id);
      setSelectedProductIds(ids);

      if (ids.length > 0) {
        runReadinessCheck('amazon', ids);
      }
    } catch (err: any) {
      console.error('Failed to load marketplace initial data:', err);
      setErrorMessage('Could not load products. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Run server-side readiness check whenever selected destination or products change
  const runReadinessCheck = async (destId: MarketplaceDestination, pIds: string[]) => {
    if (pIds.length === 0) {
      setReadinessData(null);
      return;
    }
    try {
      setValidating(true);
      const res = await marketplaceApi.checkReadiness(destId, pIds);
      setReadinessData({
        readyProductsCount: res.readyProductsCount,
        unreadyProductsCount: res.unreadyProductsCount,
        results: res.results,
      });
    } catch (err) {
      console.error('Readiness check error:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleDestinationSelect = (destId: MarketplaceDestination) => {
    setSelectedDestId(destId);
    runReadinessCheck(destId, selectedProductIds);
  };

  const handleToggleProduct = (id: string) => {
    const updated = selectedProductIds.includes(id)
      ? selectedProductIds.filter((pId) => pId !== id)
      : [...selectedProductIds, id];
    setSelectedProductIds(updated);
    runReadinessCheck(selectedDestId, updated);
  };

  const handleSelectAll = () => {
    const allIds = products.map((p) => p.id);
    setSelectedProductIds(allIds);
    runReadinessCheck(selectedDestId, allIds);
  };

  const handleDeselectAll = () => {
    setSelectedProductIds([]);
    setReadinessData(null);
  };

  const handleConfirmExport = async (allowPartial: boolean) => {
    try {
      setExporting(true);
      setErrorMessage(null);
      const res = await marketplaceApi.exportCatalog(selectedDestId, selectedProductIds, allowPartial);
      setPreviewOpen(false);
      setExportSuccessMessage(
        `Successfully downloaded "${res.filename}" (${res.report?.totalExported || selectedProductIds.length} items exported)`
      );
      setTimeout(() => setExportSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error('Export generation error:', err);
      setErrorMessage(err.message || 'Export failed. Please check required fields.');
    } finally {
      setExporting(false);
    }
  };

  const currentDest = destinations.find((d) => d.id === selectedDestId) || destinations[0];
  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  // Convert Product to CanonicalProduct for preview modal
  const canonicalProductsForPreview: CanonicalProduct[] = selectedProducts.map((p) => ({
    id: p.id,
    userId: p.userId,
    sku: p.sku || `SKU-${p.id.slice(-6)}`,
    title: p.title,
    description: p.description,
    category: p.category,
    price: p.price,
    mrp: p.mrp || Math.round(p.price * 1.25),
    currency: p.currency || 'INR',
    stock: p.stock,
    moq: p.moq || 1,
    leadTime: p.leadTime || '3-5 business days',
    weight: p.weight || '0.5 kg',
    weightKg: 0.5,
    dimensions: p.dimensions || '15x10x5 cm',
    material: p.material,
    hsnCode: p.hsnCode,
    brand: p.brand || 'Artisan Craft',
    imageUrls: p.imageUrls || [],
    primaryImageUrl: p.imageUrls?.[0],
    keywords: p.keywords || [],
    status: p.status || 'published',
    provenance: {},
  }));

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#0F5132] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-stone-600 dark:text-emerald-200">
          Loading catalog destinations and products...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter">
      {/* Toast Notifications */}
      {exportSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{exportSuccessMessage}</span>
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/80 border border-red-500/40 text-red-800 dark:text-red-200 flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-red-700 dark:text-red-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Destination Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />
              1. Choose Export Destination
            </h2>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70">
              Select the e-commerce marketplace format or universal spreadsheet you want to generate.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {destinations.map((dest) => {
            const isSelected = selectedDestId === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => handleDestinationSelect(dest.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#0F5132] dark:border-emerald-500 bg-[#0F5132]/5 dark:bg-emerald-950/50 shadow-sm ring-2 ring-[#0F5132]/20 dark:ring-emerald-500/20'
                    : 'border-stone-200 dark:border-emerald-900/40 bg-white dark:bg-[#13251B] hover:border-stone-300 dark:hover:border-emerald-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-emerald-950 text-stone-700 dark:text-emerald-300 uppercase tracking-wider font-poppins">
                      {dest.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#0F5132] dark:text-emerald-400 font-poppins">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold font-poppins text-stone-900 dark:text-white mb-1">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-emerald-300/70 line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-emerald-900/30 flex items-center justify-between text-[11px] text-stone-400 dark:text-emerald-300/50">
                  <span>Schema: {dest.schemaVersion.split('-')[0]}</span>
                  <span>Format: .{dest.format.toUpperCase()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Destination Scope Notice */}
      {currentDest && (
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-emerald-950/30 border border-stone-200 dark:border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0F5132] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-stone-700 dark:text-emerald-200/90 leading-relaxed">
              <strong className="text-stone-900 dark:text-white font-poppins">Target Scope: </strong>
              {currentDest.description}
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-mono text-stone-500 dark:text-emerald-400/70 bg-stone-200/50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-lg">
            v{currentDest.schemaVersion}
          </span>
        </div>
      )}

      {/* Catalog & Readiness Breakdown */}
      {products.length === 0 ? (
        /* Empty Catalog State */
        <div className="p-10 rounded-3xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/40 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/20 dark:border-emerald-800 flex items-center justify-center text-[#0F5132] dark:text-emerald-400">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold font-poppins text-stone-900 dark:text-white">
              No products available yet
            </h3>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70 leading-relaxed">
              Before exporting marketplace spreadsheets or ONDC feeds, add your handcrafted items in the Product Studio.
            </p>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer"
          >
            <Package className="w-4 h-4" />
            Create Your First Product
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Readiness Dashboard Banner */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
                2. Listing Readiness Check
                {validating && (
                  <RefreshCw className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 animate-spin" />
                )}
              </h2>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70">
                KRIVIO automatically inspects SKU, weight, image accessibility, and marketplace requirements for {currentDest?.name}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {readinessData && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-emerald-950/80 border border-stone-200 dark:border-emerald-800 text-xs">
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {readinessData.readyProductsCount} Ready
                  </span>
                  {readinessData.unreadyProductsCount > 0 && (
                    <>
                      <span className="text-stone-300 dark:text-emerald-800">|</span>
                      <span className="text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {readinessData.unreadyProductsCount} Need Attention
                      </span>
                    </>
                  )}
                </div>
              )}

              <button
                onClick={() => setPreviewOpen(true)}
                disabled={selectedProductIds.length === 0}
                className="px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-md transition-all font-poppins flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Preview & Export ({selectedProductIds.length})
              </button>
            </div>
          </div>

          {/* Product Selection Controls */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-stone-700 dark:text-emerald-200 font-poppins">
              Catalog Items ({selectedProductIds.length} of {products.length} selected)
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="text-[#0F5132] dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-stone-300 dark:text-emerald-800">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-stone-500 dark:text-emerald-400/60 font-medium hover:underline cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Product Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {products.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              const validationItem = readinessData?.results?.find((r) => r.productId === product.id);
              const validation = validationItem?.validation;
              const isReady = validation?.ready ?? true;

              return (
                <div
                  key={product.id}
                  onClick={() => handleToggleProduct(product.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-[#0F5132]/30 dark:border-emerald-700 bg-white dark:bg-[#13251B] shadow-xs'
                      : 'border-stone-200 dark:border-emerald-900/30 bg-stone-50/50 dark:bg-[#0E1E15]/60 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by parent onClick
                    className="mt-1 w-4 h-4 rounded text-[#0F5132] border-stone-300 dark:border-emerald-800 focus:ring-[#0F5132] cursor-pointer"
                  />

                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-emerald-950 border border-stone-200 dark:border-emerald-800/60 shrink-0 overflow-hidden flex items-center justify-center">
                    {product.imageUrls && product.imageUrls[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-stone-400 dark:text-emerald-600" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold font-poppins text-stone-900 dark:text-white truncate">
                        {product.title}
                      </h4>
                      <span className="text-xs font-bold font-poppins text-stone-900 dark:text-white shrink-0">
                        ₹{product.price}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-emerald-300/70">
                      <span className="font-mono">{product.sku || 'No SKU'}</span>
                      <span>•</span>
                      <span>{product.category}</span>
                      <span>•</span>
                      <span>{product.weight || '0.5 kg'}</span>
                    </div>

                    {/* Diagnostics badge */}
                    {isSelected && validation && (
                      <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                        {validation.ready ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Ready for {currentDest?.badge}
                          </span>
                        ) : (
                          validation.errors.map((err, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[10px] font-medium"
                            >
                              <AlertCircle className="w-3 h-3 shrink-0" /> {err.message}
                            </span>
                          ))
                        )}

                        {validation.warnings.map((warn, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-medium"
                          >
                            <AlertTriangle className="w-3 h-3 shrink-0" /> {warn.message}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Preview Modal */}
      {currentDest && (
        <ExportPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          destination={currentDest}
          products={canonicalProductsForPreview}
          validations={readinessData?.results || []}
          onConfirmExport={handleConfirmExport}
          isExporting={exporting}
        />
      )}
    </div>
  );
};
