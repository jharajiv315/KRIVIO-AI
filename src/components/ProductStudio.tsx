import React, { useEffect, useState } from 'react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import {
  Package,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  AlertCircle,
  X,
  Search,
  IndianRupee,
  Copy,
  Archive,
  Image as ImageIcon,
  Upload,
  Layers,
  Filter,
  ArrowUpDown,
  FileCheck,
} from 'lucide-react';

export const ProductStudio: React.FC = () => {
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
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop',
  ]);
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
      setProducts(data.products);
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
    setImageUrls([
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop',
    ]);
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
    setDescription(p.description);
    setPrice(p.price);
    setStock(p.stock);
    setSku(p.sku || `SKU-${p.id.slice(-5)}`);
    setWeight(p.weight || '0.5 kg');
    setDimensions(p.dimensions || '10x10x10 cm');
    setStatus(p.status || 'published');
    setKeywords(p.keywords || []);
    setImageUrls(p.imageUrls.length > 0 ? p.imageUrls : ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop']);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrls([...imageUrls, reader.result]);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    if (imageUrls.length <= 1) {
      setFormError('Product must have at least one image.');
      return;
    }
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    setFormError('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Product Title is required.');
      return;
    }
    if (price < 0) {
      setFormError('Price cannot be negative.');
      return;
    }
    if (stock < 0) {
      setFormError('Stock cannot be negative.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingId) {
        await productsApi.update(editingId, {
          title,
          description,
          category: craftType,
          price,
          stock,
          sku,
          weight,
          dimensions,
          status,
          keywords,
          imageUrls,
        });
      } else {
        const res = await productsApi.create({
          title,
          description,
          category: craftType,
          price,
          stock,
          sku,
          weight,
          dimensions,
          status,
          keywords,
          imageUrls,
        });
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Product Catalog Management
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
              AI Assisted
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize craft products, manage stock levels, auto-fill stories with AI, and prepare listings for multi-channel sales.
          </p>
        </div>

        <button
          id="btn-add-product"
          onClick={openNewProductModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0 hover:scale-102 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {warningMsg && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{warningMsg}</span>
          </div>
          <button onClick={() => setWarningMsg('')} className="p-1 hover:bg-amber-100 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Multi-Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
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
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add New Product" above to create your first item or auto-generate details with AI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-emerald-500 transition-all flex flex-col group"
            >
              {/* Image Thumbnail */}
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={p.imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop'}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {p.category}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : p.status === 'draft'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {p.status ? p.status.toUpperCase() : 'PUBLISHED'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{p.sku || 'SKU-NONE'}</span>
                    <span>Stock: {p.stock}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(p.keywords || []).slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Selling Price</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicateProduct(p.id)}
                      title="Duplicate Product"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchiveProduct(p.id)}
                      title="Archive Product"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      title="Edit Product"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      title="Delete Product"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {editingId ? 'Edit Product Listing' : 'Add New Artisan Craft'}
              </h2>
              <p className="text-xs text-slate-500">
                Type basic words about your item and let AI auto-fill e-commerce stories and keywords.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* AI Generator Magic Prompt Box */}
            <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800/80 p-4 rounded-2xl border border-amber-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  AI Story & Listing Generator
                </span>
                {aiGeneratedSuccess && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Details Auto-Filled!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={rawCraftInput}
                  onChange={(e) => setRawCraftInput(e.target.value)}
                  placeholder="Raw Name e.g. Madhubani silk painting"
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="Materials e.g. Silk cloth, organic dye"
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                id="btn-generate-ai-details"
                onClick={handleAIGenerateDetails}
                disabled={generatingAI || !rawCraftInput.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>{generatingAI ? 'Craft AI is creating listing...' : 'Auto-Generate Title, Story & Keywords'}</span>
              </button>
            </div>

            {/* Standard Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Authentic Handmade Madhubani Painting on Raw Silk"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Craft Category
                  </label>
                  <select
                    value={craftType}
                    onChange={(e) => setCraftType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Handicrafts & Art">Handicrafts & Art</option>
                    <option value="Pottery & Home Decor">Pottery & Home Decor</option>
                    <option value="Textiles & Handlooms">Textiles & Handlooms</option>
                    <option value="Organic Agri-products">Organic Agri-products</option>
                    <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-ART-1001"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weight / Dimensions
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 0.5 kg"
                      className="w-1/2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. 10x10 cm"
                      className="w-1/2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Story & Narrative Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the artisan heritage, eco-friendly materials, and unique craft tradition..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                />
              </div>

              {/* Product Gallery & Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Product Images
                </label>

                {/* Thumbnail list */}
                <div className="flex flex-wrap gap-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                    <Upload className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[9px] text-slate-500 font-medium">Upload File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or enter Image URL..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-200"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Product Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
