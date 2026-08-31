import React, { useEffect, useState } from 'react';
import { storefrontApi } from '../services/api';
import { Product, PublicStorefrontData } from '../types';
import { Logo } from './Logo';
import {
  MapPin,
  CheckCircle2,
  Share2,
  Phone,
  MessageCircle,
  Package,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  ArrowRight,
  Copy,
  Check,
  Heart,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

interface PublicStorefrontProps {
  userId?: string;
  onNavigateHome?: () => void;
  onOpenAuth?: () => void;
}

export const PublicStorefront: React.FC<PublicStorefrontProps> = ({
  userId = '',
  onNavigateHome,
  onOpenAuth,
}) => {
  const [storeData, setStoreData] = useState<PublicStorefrontData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedProduct, setCopiedProduct] = useState<string | null>(null);
  const [selectedProductPreview, setSelectedProductPreview] = useState<Product | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await storefrontApi.get(userId);
        setStoreData(data);
      } catch (err) {
        console.error('Failed to load storefront', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [userId]);

  const artisan = storeData?.artisan;
  const products = storeData?.products || [];

  // Filter Categories
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getWhatsAppLink = (product?: Product) => {
    const cleanPhone = (artisan?.phone || '').replace(/[^0-9]/g, '');
    let text = '';
    if (product) {
      text = `Namaste ${artisan?.name || 'Artisan'}! I am interested in purchasing "${product.title}" (Price: ₹${product.price}) from your KRIVIO AI digital showcase. Could you please share availability and delivery details?`;
    } else {
      text = `Namaste ${artisan?.name || 'Artisan'}! I found your digital craft showcase on KRIVIO AI and would like to inquire about your handmade products.`;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleShareStore = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `${artisan?.businessName || 'Artisan Store'} - KRIVIO AI`,
          text: `Check out handmade crafts by ${artisan?.name} on KRIVIO AI!`,
          url,
        })
        .catch(() => copyToClipboard(url));
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const productText = `Check out this authentic handmade "${product.title}" (₹${product.price}) by ${artisan?.name} on KRIVIO AI: ${window.location.href}`;
    navigator.clipboard.writeText(productText);
    setCopiedProduct(product.id);
    setTimeout(() => setCopiedProduct(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] dark:bg-[#0B1911] flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-12 h-12 border-3 border-[#0F5132]/20 border-t-[#0F5132] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#0F5132] font-poppins">Loading Artisan Showcase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#1A1A1A] font-inter selection:bg-[#0F5132] selection:text-white">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-40 bg-[#F8F9F5]/95 backdrop-blur-md border-b border-[#0F5132]/10 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Logo variant="horizontal" size="xs" showTagline={false} />
            </button>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F5132]/10 text-[#0F5132] font-poppins">
              Gramin Showcase
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShareStore}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-[#0F5132]/20 text-[#0F5132] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer font-poppins active:scale-95"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#0F5132]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Store'}</span>
            </button>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer font-poppins"
              >
                <span>Artisan Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner with Artisan Enterprise Profile */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F5132]/10 via-[#F8F9F5] to-[#F8F9F5] border-b border-[#0F5132]/10 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#0F5132]/15 shadow-xl relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0F5132] via-[#2E7D32] to-[#D4AF37]" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#0F5132] to-[#2E7D32] text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-[#D4AF37] shrink-0 font-poppins">
                  {artisan?.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#1A1A1A] font-poppins">
                      <Award className="w-3 h-3" />
                      Verified Rural Artisan
                    </span>
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0F5132]" />
                      {artisan?.location || 'Madhubani, Bihar'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F5132] font-poppins leading-tight">
                    {artisan?.businessName || 'Artisan Craft Enterprise'}
                  </h1>

                  <p className="text-xs sm:text-sm font-semibold text-stone-600 font-inter">
                    Lead Artisan: <span className="text-[#0F5132] font-bold">{artisan?.name}</span> •{' '}
                    <span className="text-[#8B6E10] font-medium">{artisan?.craftType}</span>
                  </p>
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#25D366]/20 transition-all font-poppins active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Inquire on WhatsApp</span>
                </a>

                {artisan?.phone && (
                  <a
                    href={`tel:${artisan.phone}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-stone-50 border border-[#0F5132]/25 text-[#0F5132] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all font-poppins active:scale-98"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Artisan</span>
                  </a>
                )}
              </div>
            </div>

            {/* Artisan Craft Story */}
            {artisan?.story && (
              <div className="mt-6 pt-6 border-t border-stone-100 flex items-start gap-3 bg-[#F8F9F5] p-4 sm:p-5 rounded-2xl">
                <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F5132] font-poppins">
                    Craft Tradition & Story
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-inter">{artisan.story}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Catalog Search & Category Filter */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F5132] font-poppins flex items-center gap-2">
              <Package className="w-6 h-6 text-[#0F5132]" />
              <span>Handcrafted Catalog</span>
              <span className="text-xs font-bold text-stone-500 bg-stone-200/70 px-2.5 py-0.5 rounded-full">
                {filteredProducts.length} items
              </span>
            </h2>
            <p className="text-xs text-stone-500 font-inter mt-0.5">
              Direct from the artisan with zero middleman commissions.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search crafts, pottery, paintings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#0F5132]/20 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-[#0F5132] outline-none shadow-xs font-inter"
            />
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all font-poppins cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F5132] text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat === 'all' ? 'All Products' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#0F5132]/20 p-8">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-700 font-poppins">No Products Found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto font-inter">
              No handcrafted items matched your current search. Try changing keywords or category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setSelectedProductPreview(prod)}
                className="group bg-white rounded-3xl border border-[#0F5132]/15 shadow-xs hover:shadow-xl hover:border-[#0F5132]/40 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={
                      prod.imageUrls && prod.imageUrls[0]
                        ? prod.imageUrls[0]
                        : 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'
                    }
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-[#0F5132] border border-[#0F5132]/20 font-poppins">
                    {prod.category}
                  </span>

                  {prod.stock > 0 ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#0F5132] text-white shadow-xs font-poppins">
                      In Stock ({prod.stock})
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-600 text-white font-poppins">
                      Made to Order
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-[#0F5132] font-poppins line-clamp-2 leading-snug group-hover:text-[#2E7D32] transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-stone-600 font-inter line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Specifications & Price */}
                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    {(prod.dimensions || prod.weight) && (
                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-inter">
                        {prod.dimensions && <span>Size: {prod.dimensions}</span>}
                        {prod.weight && <span>Weight: {prod.weight}</span>}
                      </div>
                    )}

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-extrabold text-[#0F5132] font-poppins">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium ml-1.5">Fair Artisan Price</span>
                      </div>
                    </div>

                    {/* WhatsApp Action Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={getWhatsAppLink(prod)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl shadow-xs transition-all font-poppins active:scale-98"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>Order on WhatsApp</span>
                      </a>

                      <button
                        onClick={(e) => handleShareProduct(prod, e)}
                        title="Copy direct product link"
                        className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors shrink-0"
                      >
                        {copiedProduct === prod.id ? (
                          <Check className="w-4 h-4 text-[#0F5132]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Buyer Trust Guarantees */}
      <section className="py-12 bg-white border-t border-[#0F5132]/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-[#F8F9F5] border border-[#0F5132]/10 space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#0F5132] mx-auto" />
              <h4 className="font-bold text-sm text-[#0F5132] font-poppins">100% Direct from Artisan</h4>
              <p className="text-xs text-stone-600 font-inter">
                Every rupee directly supports the rural artisan family with zero middleman deductions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9F5] border border-[#0F5132]/10 space-y-2">
              <Award className="w-8 h-8 text-[#D4AF37] mx-auto" />
              <h4 className="font-bold text-sm text-[#0F5132] font-poppins">Authentic Craft Heritage</h4>
              <p className="text-xs text-stone-600 font-inter">
                Generational indigenous art made with natural, sustainable, and eco-friendly raw materials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9F5] border border-[#0F5132]/10 space-y-2">
              <MessageCircle className="w-8 h-8 text-[#25D366] mx-auto" />
              <h4 className="font-bold text-sm text-[#0F5132] font-poppins">Safe WhatsApp Order</h4>
              <p className="text-xs text-stone-600 font-inter">
                Directly chat with the creator to customize colors, bulk quantities, and safe dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProductPreview && (
        <div
          onClick={() => setSelectedProductPreview(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#0F5132]/20 space-y-6 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F5132]/10 text-[#0F5132] font-poppins">
                  {selectedProductPreview.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F5132] font-poppins mt-1">
                  {selectedProductPreview.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProductPreview(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-100">
              <img
                src={
                  selectedProductPreview.imageUrls && selectedProductPreview.imageUrls[0]
                    ? selectedProductPreview.imageUrls[0]
                    : 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'
                }
                alt={selectedProductPreview.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 font-inter text-xs sm:text-sm text-stone-700">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#0F5132] font-poppins">Description</h4>
              <p className="leading-relaxed">{selectedProductPreview.description}</p>

              {(selectedProductPreview.dimensions || selectedProductPreview.weight) && (
                <div className="p-4 bg-[#F8F9F5] rounded-xl grid grid-cols-2 gap-3 text-xs">
                  {selectedProductPreview.dimensions && (
                    <div>
                      <span className="font-bold text-stone-500">Dimensions:</span>{' '}
                      <span className="text-stone-900">{selectedProductPreview.dimensions}</span>
                    </div>
                  )}
                  {selectedProductPreview.weight && (
                    <div>
                      <span className="font-bold text-stone-500">Weight:</span>{' '}
                      <span className="text-stone-900">{selectedProductPreview.weight}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-extrabold text-[#0F5132] font-poppins">
                  ₹{selectedProductPreview.price.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-stone-500">Zero Middleman Markup</div>
              </div>

              <a
                href={getWhatsAppLink(selectedProductPreview)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm rounded-xl shadow-md transition-all font-poppins"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0B1911] text-white py-12 px-4 sm:px-8 border-t border-[#0F5132]/30 text-center font-inter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center">
            <Logo variant="horizontal" size="sm" showTagline={true} />
          </div>

          <p className="text-xs text-emerald-200/80 max-w-md mx-auto leading-relaxed">
            Empowering rural artisans, Self-Help Groups, and traditional craftspeople across India with Vernacular Voice AI.
          </p>

          <div className="pt-6 border-t border-emerald-950/80 text-[11px] text-emerald-400/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} KRIVIO AI. From Local Hands to Global Markets.</span>
            <button
              onClick={onNavigateHome}
              className="text-[#D4AF37] hover:underline font-semibold font-poppins cursor-pointer"
            >
              Are you an artisan? Build your free digital storefront →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
