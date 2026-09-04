import React, { useEffect, useState } from 'react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import { useI18n } from '../i18n/LanguageContext';
import {
  Package,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Copy,
  Archive,
  Upload,
} from 'lucide-react';

export const ProductStudio: React.FC = () => {
  const { t, formatCurrency, currentLanguageConfig } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Form states
  const [title, setTitle] = useState('');
  const [rawCraftInput, setRawCraftInput] = useState('');
  const [craftType, setCraftType] = useState('Handicrafts & Art');
  const [materials, setMaterials] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(850);
  const [stock, setStock] = useState<number>(10);
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('0.5 kg');
  const [dimensions, setDimensions] = useState('10x10x10 cm');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll({
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        sort: sortOption,
      });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, statusFilter, sortOption]);

  const openNewProductModal = () => {
    setEditingId(null);
    setTitle('');
    setRawCraftInput('');
    setCraftType('Handicrafts & Art');
    setMaterials('');
    setDescription('');
    setPrice(850);
    setStock(10);
    setSku(`SKU-ART-${Date.now().toString().slice(-5)}`);
    setWeight('0.5 kg');
    setDimensions('10x10x10 cm');
    setStatus('published');
    setKeywords(['handmade', 'artisan']);
    setImageUrls([]);
    setNewImageUrl('');
    setFormError('');
    setWarningMsg('');
    setAiGeneratedSuccess(false);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setTitle(p.title);
    setRawCraftInput(p.title);
    setCraftType(p.category);
    setDescription(p.description || '');
    setPrice(p.price);
    setStock(p.stock);
    setSku(p.sku || `SKU-${p.id.slice(-5)}`);
    setWeight(p.weight || '0.5 kg');
    setDimensions(p.dimensions || '10x10x10 cm');
    setStatus(p.status || 'published');
    setKeywords(p.keywords || []);
    setImageUrls(Array.isArray(p.imageUrls) ? p.imageUrls : []);
    setNewImageUrl('');
    setFormError('');
    setWarningMsg('');
    setModalOpen(true);
  };

  const handleAIGenerateDetails = async () => {
    if (!rawCraftInput.trim()) return;
    setGeneratingAI(true);
    setAiGeneratedSuccess(false);

    try {
      const res = await productsApi.generateDetails({
        rawName: rawCraftInput,
        craftType,
        materials,
        targetPrice: price,
        language: currentLanguageConfig.name,
      });

      const data = res.data;
      if (data) {
        setTitle(data.title || rawCraftInput);
        setDescription(data.description || '');
        if (data.category) setCraftType(data.category);
        if (data.suggestedPrice) setPrice(data.suggestedPrice);
        if (Array.isArray(data.keywords)) setKeywords(data.keywords);
        setAiGeneratedSuccess(true);
      }
    } catch (err) {
      console.error('Failed to generate product details with Gemini', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 15 * 1024 * 1024) {
      setFormError('Image size exceeds 15MB limit. Please choose a smaller file.');
      return;
    }

    try {
      setFormError('');
      const compressedDataUrl = await compressImage(file);
      setImageUrls((prev) => [...prev, compressedDataUrl]);
    } catch {
      setFormError('Failed to process photo. Please try another image.');
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    setFormError('');
  };

  const handleSaveProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setFormError(t('validation.required') || 'Product title is required.');
      return;
    }

    const numPrice = typeof price === 'number' ? (isNaN(price) ? 0 : price) : (parseFloat(String(price || 0).replace(/[^0-9.]/g, '')) || 0);
    const numStock = typeof stock === 'number' ? (isNaN(stock) ? 1 : stock) : (parseInt(String(stock || 1).replace(/[^0-9]/g, ''), 10) || 1);

    if (numPrice < 0) {
      setFormError(t('validation.positiveNumber') || 'Price cannot be negative.');
      return;
    }
    if (numStock < 0) {
      setFormError(t('validation.positiveNumber') || 'Stock cannot be negative.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: craftType,
        price: numPrice,
        stock: numStock,
        sku: sku.trim() || `SKU-ART-${Date.now().toString().slice(-5)}`,
        weight: weight.trim() || '0.5 kg',
        dimensions: dimensions.trim() || '10x10x10 cm',
        material: materials.trim(),
        status,
        keywords,
        imageUrls,
      };

      if (editingId) {
        await productsApi.update(editingId, payload);
      } else {
        const res = await productsApi.create(payload);
        if (res.warning) {
          setWarningMsg(res.warning);
        }
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product listing.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product listing?')) {
      await productsApi.delete(id);
      fetchProducts();
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      await productsApi.duplicate(id);
      fetchProducts();
    } catch (err) {
      console.error('Failed to duplicate product', err);
    }
  };

  const handleArchiveProduct = async (id: string) => {
    try {
      await productsApi.archive(id);
      fetchProducts();
    } catch (err) {
      console.error('Failed to archive product', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 font-inter">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-poppins">
              {t('product.title')}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-[#0F5132]/20 dark:border-emerald-800 font-poppins">
              {t('product.generateWithAi') || 'AI Assisted'}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-emerald-300/70">
            {t('product.subtitle')}
          </p>
        </div>

        <button
          id="btn-add-product"
          onClick={openNewProductModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0 active:scale-98 font-poppins cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('product.addProduct')}</span>
        </button>
      </div>

      {warningMsg && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{warningMsg}</span>
          </div>
          <button onClick={() => setWarningMsg('')} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Multi-Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 bg-white dark:bg-[#13251B] p-3.5 sm:p-4 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
          <Search className="w-4 h-4 text-stone-400 dark:text-emerald-400/60 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('common.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/15 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132]"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label={t('common.filter')}
            className="w-full px-3 py-2 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/15 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132] cursor-pointer"
          >
            <option value="">{t('common.all')}</option>
            <option value="Handicrafts & Art">Handicrafts & Art</option>
            <option value="Pottery & Home Decor">Pottery & Home Decor</option>
            <option value="Textiles & Handlooms">Textiles & Handlooms</option>
            <option value="Organic Agri-products">Organic Agri-products</option>
            <option value="Jewelry & Accessories">Jewelry & Accessories</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={t('common.status')}
            className="w-full px-3 py-2 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/15 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132] cursor-pointer"
          >
            <option value="">{t('common.all')}</option>
            <option value="published">{t('subscription.active')}</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort products"
            className="w-full px-3 py-2 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/15 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132] cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="alphabetical">Sort: Name A-Z</option>
            <option value="price_asc">Sort: Price Low to High</option>
            <option value="price_desc">Sort: Price High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-stone-200 dark:bg-[#183023] rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#13251B] rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-[#34D399] mx-auto flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
              {t('product.emptyStateTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70 max-w-sm mx-auto font-inter">
              {t('product.emptyStateSubtitle')}
            </p>
          </div>
          <button
            onClick={openNewProductModal}
            className="px-6 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 font-poppins cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>{t('product.addProduct')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#13251B] rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 overflow-hidden shadow-xs hover:border-[#0F5132] dark:hover:border-emerald-400 transition-all flex flex-col group"
            >
              {/* Image Thumbnail */}
              <div className="relative h-48 bg-[#F8F9F5] dark:bg-[#0E2016] overflow-hidden flex items-center justify-center">
                {p.imageUrls && p.imageUrls.length > 0 && p.imageUrls[0] ? (
                  <img
                    src={p.imageUrls[0]}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-400 dark:text-emerald-400/50 space-y-1.5 p-4 text-center">
                    <Package className="w-10 h-10 stroke-1" />
                    <span className="text-[11px] font-medium font-inter">{t('imageStudio.dropzone')}</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-[#13251B]/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-800 dark:text-emerald-200 border border-[#0F5132]/15 dark:border-emerald-900/40 font-poppins">
                  {p.category}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 font-poppins">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'published'
                        ? 'bg-[#0F5132]/15 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 border border-[#0F5132]/20'
                        : p.status === 'draft'
                        ? 'bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'bg-stone-100 text-stone-700 dark:bg-[#183023] dark:text-stone-300'
                    }`}
                  >
                    {p.status ? p.status.toUpperCase() : 'PUBLISHED'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-emerald-400/60 font-mono">
                    <span>{p.sku || 'SKU-NONE'}</span>
                    <span>{t('product.tableStock')}: {p.stock}</span>
                  </div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white line-clamp-1 font-poppins">
                    {p.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-emerald-200/80 line-clamp-2 leading-relaxed font-inter">
                    {p.description}
                  </p>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(p.keywords || []).slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-stone-100 dark:bg-[#183023] text-stone-600 dark:text-emerald-300/80 rounded text-[10px] font-medium font-inter"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="pt-3 border-t border-stone-100 dark:border-emerald-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-emerald-400/60 block font-medium">{t('product.tablePrice')}</span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-white font-poppins">
                      {formatCurrency(p.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicateProduct(p.id)}
                      title="Duplicate Product"
                      aria-label="Duplicate Product"
                      className="p-2 text-stone-400 hover:text-[#0F5132] hover:bg-[#0F5132]/10 dark:hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchiveProduct(p.id)}
                      title="Archive Product"
                      aria-label="Archive Product"
                      className="p-2 text-stone-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 dark:hover:bg-amber-950 rounded-lg transition-colors cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      title="Edit Product"
                      aria-label="Edit Product"
                      className="p-2 text-stone-400 hover:text-[#0F5132] hover:bg-[#0F5132]/10 dark:hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      title={t('common.delete')}
                      aria-label={t('common.delete')}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#13251B] rounded-3xl max-w-3xl w-full shadow-2xl border border-[#0F5132]/20 dark:border-emerald-800/60 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Sticky Header */}
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-stone-200/80 dark:border-emerald-800/50 flex items-center justify-between bg-white dark:bg-[#13251B] shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-poppins">
                  {editingId ? (t('product.editProduct') || 'Edit Product') : (t('product.addProduct') || 'Add New Product')}
                </h2>
                <p className="text-[11px] text-stone-500 dark:text-emerald-300/70">
                  {t('product.subtitle') || 'Catalog your inventory, generate AI marketing stories, and prepare for marketplace listing.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label={t('common.close') || 'Close'}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="product-form" onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">
              {formError && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* AI Generator Magic Prompt Box */}
              <div className="bg-[#0F5132]/5 dark:bg-[#183023]/70 p-4 rounded-2xl border border-[#0F5132]/20 dark:border-emerald-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 dark:text-white font-poppins flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    {t('product.generateWithAi') || 'AI Assistant Generator'}
                  </span>
                  {aiGeneratedSuccess && (
                    <span className="text-[11px] font-bold text-[#0F5132] dark:text-emerald-400 flex items-center gap-1 font-poppins">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('common.success') || 'Generated!'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={rawCraftInput}
                    onChange={(e) => setRawCraftInput(e.target.value)}
                    placeholder={t('product.namePlaceholder') || 'e.g. Handcrafted Madhubani Silk Dupatta'}
                    className="px-3.5 py-2 bg-white dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder={t('product.materialsPlaceholder') || 'Materials e.g. Silk cloth, organic dye'}
                    className="px-3.5 py-2 bg-white dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                </div>

                <button
                  type="button"
                  id="btn-generate-ai-details"
                  onClick={handleAIGenerateDetails}
                  disabled={generatingAI || !rawCraftInput.trim()}
                  className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-poppins cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>{generatingAI ? (t('product.generatingWithAi') || 'AI Generating Details...') : (t('product.generateWithAi') || 'Auto-Fill Details with AI')}</span>
                </button>
              </div>

              {/* Standard Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('product.nameLabel') || 'Product Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('product.namePlaceholder') || 'e.g. Madhubani Handpainted Silk Scarf'}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-semibold font-inter"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('product.categoryLabel') || 'Category'}
                  </label>
                  <select
                    value={craftType}
                    onChange={(e) => setCraftType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none cursor-pointer"
                  >
                    <option value="Handicrafts & Art">Handicrafts & Art</option>
                    <option value="Pottery & Home Decor">Pottery & Home Decor</option>
                    <option value="Textiles & Handlooms">Textiles & Handlooms</option>
                    <option value="Organic Agri-products">Organic Agri-products</option>
                    <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('common.status') || 'Listing Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none cursor-pointer"
                  >
                    <option value="published">{t('subscription.active') || 'Published / Active'}</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('product.priceLabel') || 'Selling Price'} (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('product.stockLabel') || 'Available Stock'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('product.skuLabel') || 'SKU Code'}
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-ART-1001"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('product.weightLabel') || 'Weight'} & {t('product.dimensionsLabel') || 'Dimensions'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 0.5 kg"
                      className="w-1/2 px-3 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white outline-none"
                    />
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. 10x10x10 cm"
                      className="w-1/2 px-3 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                  {t('product.descLabel') || 'Description & Artisan Story'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={t('product.descPlaceholder') || 'Describe the traditional technique, materials, and cultural heritage of this item...'}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none leading-relaxed font-inter"
                />
              </div>

              {/* Product Gallery & Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 font-poppins">
                  {t('product.imagesLabel') || 'Product Photos'}
                </label>

                {/* Thumbnail list */}
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#0F5132]/20 dark:border-emerald-800/60 group shadow-xs">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#0F5132]/30 dark:border-emerald-800/60 flex flex-col items-center justify-center cursor-pointer hover:border-[#0F5132] transition-colors bg-[#F8F9F5] dark:bg-[#0E2016]">
                    <Upload className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 mb-1" />
                    <span className="text-[9px] text-stone-500 dark:text-emerald-300/70 font-medium font-poppins">{t('imageStudio.dropzone') || 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste direct image URL..."
                    className="flex-1 px-3 py-2 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-stone-100 dark:bg-[#183023] hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-xs font-semibold rounded-xl text-stone-800 dark:text-emerald-200 font-poppins cursor-pointer"
                  >
                    + Add URL
                  </button>
                </div>
              </div>
            </form>

            {/* Sticky Action Footer */}
            <div className="px-5 sm:px-7 py-3.5 sm:py-4 border-t border-stone-200/80 dark:border-emerald-800/50 flex items-center justify-end gap-3 bg-stone-50/95 dark:bg-[#0E2016]/95 backdrop-blur-xs shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 bg-white dark:bg-[#183023] hover:bg-stone-100 dark:hover:bg-emerald-900/40 border border-stone-200 dark:border-emerald-800/60 text-stone-700 dark:text-emerald-200 font-semibold text-xs rounded-xl transition-colors font-poppins cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer flex items-center gap-2 active:scale-98"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('common.saving') || 'Saving...'}</span>
                  </>
                ) : (
                  <span>{editingId ? (t('common.save') || 'Save Changes') : (t('product.saveProduct') || 'Save Product')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
