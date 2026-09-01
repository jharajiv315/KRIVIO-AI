import React, { useEffect, useState } from 'react';
import { storefrontApi } from '../services/api';
import { Product, PublicStorefrontData } from '../types';
import { Logo } from './Logo';
import { useI18n } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import {
  MapPin,
  CheckCircle2,
  Share2,
  Phone,
  MessageCircle,
  Package,
  Search,
  Check,
  ChevronRight,
  X,
  Copy,
  ShieldCheck,
  Award,
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
  const { t, formatCurrency } = useI18n();
  const [storeData, setStoreData] = useState<PublicStorefrontData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedProduct, setCopiedProduct] = useState<string | null>(null);
  const [selectedProductPreview, setSelectedProductPreview] = useState<Product | null>(null);

  // Real WhatsApp Inquiry & Order State
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [inquiryType, setInquiryType] = useState<'order' | 'custom' | 'bulk' | 'question'>('order');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [deliveryCity, setDeliveryCity] = useState<string>('');
  const [deliveryPincode, setDeliveryPincode] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [inquiryCopied, setInquiryCopied] = useState<boolean>(false);

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

  const formatWhatsAppNumber = (rawPhone?: string) => {
    if (!rawPhone) return '';
    let digits = rawPhone.replace(/[^0-9]/g, '');
    if (digits.length === 10) return '91' + digits;
    if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
    return digits;
  };

  const openInquiryModal = (product?: Product, type: 'order' | 'custom' | 'bulk' | 'question' = 'order') => {
    setInquiryProduct(product || null);
    setInquiryType(type);
    setOrderQuantity(1);
    setInquiryCopied(false);
    setInquiryModalOpen(true);
  };

  const generateWhatsAppMessage = () => {
    const artisanName = artisan?.name || 'Artisan';
    const bizName = artisan?.businessName || 'Artisan Enterprise';
    const storeUrl = window.location.href;

    if (inquiryProduct) {
      const unitPrice = inquiryProduct.price || 0;
      const total = unitPrice * orderQuantity;
      const typeTitle =
        inquiryType === 'custom'
          ? '🎨 CUSTOM CRAFT REQUEST'
          : inquiryType === 'bulk'
          ? '📦 BULK / WHOLESALE INQUIRY'
          : inquiryType === 'question'
          ? '💬 PRODUCT INQUIRY'
          : '🛍️ DIRECT PURCHASE ORDER';

      const lines = [
        `*${typeTitle}*`,
        `*To:* ${bizName} (${artisanName})`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `*Item:* ${inquiryProduct.title}`,
        `*Category:* ${inquiryProduct.category}`,
        inquiryProduct.sku ? `*SKU:* ${inquiryProduct.sku}` : null,
        `*Quantity:* ${orderQuantity} unit${orderQuantity > 1 ? 's' : ''}`,
        `*Price:* ₹${unitPrice.toLocaleString('en-IN')} / unit`,
        `*Estimated Total:* ₹${total.toLocaleString('en-IN')}`,
        deliveryCity || deliveryPincode
          ? `*Delivery To:* ${deliveryCity}${deliveryPincode ? ` (PIN: ${deliveryPincode})` : ''}`
          : null,
        buyerName ? `*Buyer Name:* ${buyerName}` : null,
        customNote ? `*Special Request:* ${customNote}` : null,
        `━━━━━━━━━━━━━━━━━━━━`,
        `*Store Link:* ${storeUrl}`,
        `_Inquiry sent via KRIVIO AI Rural Marketplace_`,
        ``,
        `Namaste ${artisanName}! I would like to confirm availability and dispatch options for this order.`
      ];

      return lines.filter(Boolean).join('\n');
    }

    const lines = [
      `*GENERAL INQUIRY FOR ${bizName.toUpperCase()}*`,
      `*Artisan:* ${artisanName}`,
      `*Location:* ${artisan?.location || 'India'}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      buyerName ? `*Buyer Name:* ${buyerName}` : null,
      customNote
        ? `*Message:* ${customNote}`
        : `Namaste ${artisanName}! I found your digital craft showcase on KRIVIO AI and would like to inquire about your handmade craft catalog and custom orders.`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `*Artisan Showcase:* ${storeUrl}`,
      `_Inquiry sent via KRIVIO AI Rural Marketplace_`
    ];

    return lines.filter(Boolean).join('\n');
  };

  const handleSendWhatsApp = () => {
    const msg = generateWhatsAppMessage();
    const phone = formatWhatsAppNumber(artisan?.phone);

    // Track inquiry in real database activity log
    if (artisan?.id) {
      storefrontApi.trackInquiry({
        userId: artisan.id,
        productTitle: inquiryProduct?.title || 'General Showcase',
        quantity: orderQuantity,
        totalAmount: (inquiryProduct?.price || 0) * orderQuantity,
        city: deliveryCity,
        pincode: deliveryPincode,
        buyerName: buyerName || 'Direct Buyer',
        inquiryType:
          inquiryType === 'custom'
            ? 'Custom Request'
            : inquiryType === 'bulk'
            ? 'Bulk Inquiry'
            : inquiryType === 'question'
            ? 'Question'
            : 'Direct Order'
      });
    }

    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    setInquiryModalOpen(false);
  };

  const handleCopyInquiryText = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setInquiryCopied(true);
    setTimeout(() => setInquiryCopied(false), 2500);
  };

  const handleShareStore = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `${artisan?.businessName || 'Artisan Store'} - KRIVIO AI`,
          text: `Check out authentic handmade crafts by ${artisan?.name} on KRIVIO AI!`,
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
    const productText = `Check out this authentic handmade "${product.title}" (${formatCurrency(product.price)}) by ${artisan?.name} on KRIVIO AI: ${window.location.href}`;
    navigator.clipboard.writeText(productText);
    setCopiedProduct(product.id);
    setTimeout(() => setCopiedProduct(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9F5] dark:bg-[#0B1911] flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-12 h-12 border-3 border-[#0F5132]/20 border-t-[#0F5132] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#0F5132] font-poppins">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-[#1A1A1A] font-inter selection:bg-[#0F5132] selection:text-white pb-24">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#0F5132]/10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
            <Logo size="sm" />
            <div className="hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F5132] bg-[#0F5132]/10 px-2 py-0.5 rounded-full font-poppins">
                {t('storefront.title')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="compact" />
            <button
              onClick={handleShareStore}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all font-poppins cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#0F5132]" /> : <Share2 className="w-3.5 h-3.5 text-stone-700" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Store'}</span>
            </button>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-[#0F5132] hover:bg-[#0B3D26] rounded-xl shadow-xs transition-all font-poppins cursor-pointer"
              >
                <span>{t('auth.login')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Artisan Banner */}
      <section className="bg-gradient-to-b from-[#0F5132] via-[#123524] to-[#0B1911] text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-left">
            {/* Avatar Badge */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] p-1 shadow-2xl shrink-0">
              <div className="w-full h-full rounded-[22px] bg-[#0F5132] flex items-center justify-center text-white text-3xl font-black font-poppins">
                {artisan?.name ? artisan.name.charAt(0).toUpperCase() : 'A'}
              </div>
              {artisan?.isVerified && (
                <div
                  title="Verified Rural Artisan"
                  className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-stone-950 p-1.5 rounded-full shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Artisan Details */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37] text-stone-950 font-poppins uppercase tracking-wider">
                  {artisan?.craftType || 'Handicrafts & Art'}
                </span>
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-emerald-200 backdrop-blur-xs flex items-center gap-1 font-poppins">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  {artisan?.location || 'India'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold font-poppins tracking-tight">
                {artisan?.businessName || `${artisan?.name}'s Digital Showcase`}
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl font-inter leading-relaxed">
                {artisan?.story}
              </p>

              {/* Direct WhatsApp & Contact CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => openInquiryModal(undefined, 'question')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all font-poppins active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{t('storefront.contactArtisan')}</span>
                </button>

                {artisan?.phone && (
                  <a
                    href={`tel:${artisan.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition-all font-poppins"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{t('businessProfile.ownerDetails')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Search & Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-[#0F5132]/10 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F9F5] border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-2 focus:ring-[#0F5132] font-inter"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-poppins cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F5132] text-white shadow-xs'
                    : 'bg-[#F8F9F5] text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat === 'all' ? t('common.all') : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-poppins">{t('storefront.products')}</h2>
            <p className="text-xs text-stone-500 font-inter">{t('storefront.craftStory')}</p>
          </div>
          <span className="text-xs font-bold text-[#0F5132] font-poppins bg-[#0F5132]/10 px-3 py-1 rounded-full">
            {filteredProducts.length} Items Listed
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#0F5132]/10 space-y-4">
            <Package className="w-12 h-12 text-stone-300 mx-auto stroke-1" />
            <h3 className="text-sm font-bold text-stone-900 font-poppins">{t('products.emptyTitle')}</h3>
            <p className="text-xs text-stone-500 font-inter max-w-sm mx-auto">
              {t('products.emptySubtitle')}
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
                <div className="relative aspect-4/3 overflow-hidden bg-[#F8F9F5] flex items-center justify-center">
                  {prod.imageUrls && prod.imageUrls.length > 0 && prod.imageUrls[0] ? (
                    <img
                      src={prod.imageUrls[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400 space-y-1 p-4">
                      <Package className="w-10 h-10 stroke-1" />
                      <span className="text-[10px] font-medium font-inter">No Photo</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-[#0F5132] border border-[#0F5132]/20 font-poppins">
                    {prod.category}
                  </span>

                  {prod.stock > 0 ? (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#0F5132] text-white shadow-xs font-poppins">
                      {t('products.inStock')} ({prod.stock})
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-600 text-white font-poppins">
                      {t('products.outOfStock')}
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
                          {formatCurrency(prod.price)}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium ml-1.5">Fair Artisan Price</span>
                      </div>
                    </div>

                    {/* WhatsApp Action Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInquiryModal(prod, 'order');
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl shadow-xs transition-all font-poppins active:scale-98 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>{t('storefront.orderOnWhatsApp')}</span>
                      </button>

                      <button
                        onClick={(e) => handleShareProduct(prod, e)}
                        title="Copy direct product link"
                        className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors shrink-0 cursor-pointer"
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

      {/* Floating Instant WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => openInquiryModal(undefined, 'question')}
          className="px-5 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 font-poppins cursor-pointer group"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <MessageCircle className="w-5 h-5 fill-white" />
          <span>Chat with Artisan</span>
        </button>
      </div>

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
                aria-label="Close dialog"
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#F8F9F5] flex items-center justify-center">
              {selectedProductPreview.imageUrls && selectedProductPreview.imageUrls.length > 0 && selectedProductPreview.imageUrls[0] ? (
                <img
                  src={selectedProductPreview.imageUrls[0]}
                  alt={selectedProductPreview.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-400 space-y-2 p-8">
                  <Package className="w-12 h-12 stroke-1" />
                  <span className="text-xs font-medium font-inter">No Photo Uploaded</span>
                </div>
              )}
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
                <span className="text-xs text-stone-400 font-medium block font-poppins">Direct Artisan Price</span>
                <span className="text-2xl font-black text-[#0F5132] font-poppins">
                  ₹{selectedProductPreview.price.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const prod = selectedProductPreview;
                    setSelectedProductPreview(null);
                    openInquiryModal(prod, 'order');
                  }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Order on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real WhatsApp Order & Inquiry Slip Modal */}
      {inquiryModalOpen && (
        <div
          onClick={() => setInquiryModalOpen(false)}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-[#0F5132]/20 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 font-poppins">
                    {inquiryProduct ? `Order: ${inquiryProduct.title}` : `Inquiry for ${artisan?.name || 'Artisan'}`}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-inter">
                    Direct WhatsApp order slip with zero commission
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInquiryModalOpen(false)}
                aria-label="Close dialog"
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inquiry Type Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 font-poppins">
                Select Request Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'order', label: '🛍️ Buy Item' },
                  { id: 'custom', label: '🎨 Custom Color/Size' },
                  { id: 'bulk', label: '📦 Bulk / Wholesale' },
                  { id: 'question', label: '💬 Ask Question' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setInquiryType(t.id as any)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold font-poppins transition-all border cursor-pointer ${
                      inquiryType === t.id
                        ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-xs'
                        : 'bg-[#F8F9F5] text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Summary if product selected */}
            {inquiryProduct && (
              <div className="p-3.5 bg-[#F8F9F5] rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {inquiryProduct.imageUrls && inquiryProduct.imageUrls[0] ? (
                    <img
                      src={inquiryProduct.imageUrls[0]}
                      alt={inquiryProduct.title}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400">
                      <Package className="w-6 h-6 stroke-1" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 font-poppins line-clamp-1">
                      {inquiryProduct.title}
                    </h4>
                    <p className="text-[11px] text-[#0F5132] font-semibold font-poppins">
                      ₹{inquiryProduct.price.toLocaleString('en-IN')} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold font-poppins px-1.5">{orderQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(orderQuantity + 1)}
                    className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Buyer Details Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 font-poppins mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3.5 py-2 bg-[#F8F9F5] border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-2 focus:ring-[#0F5132]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 font-poppins mb-1">
                  Delivery Destination / Pincode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="City / State"
                    className="w-1/2 px-3 py-2 bg-[#F8F9F5] border border-stone-200 rounded-xl text-xs text-stone-900 outline-none"
                  />
                  <input
                    type="text"
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                    placeholder="PIN Code"
                    className="w-1/2 px-3 py-2 bg-[#F8F9F5] border border-stone-200 rounded-xl text-xs text-stone-900 outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 font-poppins mb-1">
                  Special Notes / Custom Requirements
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Please share packaging photos before dispatch / Need blue shade..."
                  className="w-full px-3.5 py-2 bg-[#F8F9F5] border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-2 focus:ring-[#0F5132]"
                />
              </div>
            </div>

            {/* Live Message Slip Preview */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider font-poppins">
                Live WhatsApp Message Preview
              </span>
              <div className="p-3 bg-[#E7FFDB] border border-[#25D366]/30 rounded-2xl text-[11px] text-stone-800 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {generateWhatsAppMessage()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleCopyInquiryText}
                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 font-poppins transition-colors cursor-pointer"
              >
                {inquiryCopied ? <Check className="w-4 h-4 text-[#0F5132]" /> : <Copy className="w-4 h-4" />}
                <span>{inquiryCopied ? 'Slip Copied to Clipboard!' : 'Copy Order Slip'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 font-poppins shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open in WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
