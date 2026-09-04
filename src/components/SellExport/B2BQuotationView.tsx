import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import {
  PricingTier,
  Quotation,
  QuotationBuyerInput,
  QuotationItemInput,
} from '../../types/marketplace';
import { productsApi, quotationsApi } from '../../services/api';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  Package,
  Clock,
  Sparkles,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

interface B2BQuotationViewProps {
  onNavigateToProducts: () => void;
}

export const B2BQuotationView: React.FC<B2BQuotationViewProps> = ({ onNavigateToProducts }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [buyer, setBuyer] = useState<QuotationBuyerInput>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
  });

  const [selectedItems, setSelectedItems] = useState<
    (QuotationItemInput & { hasTiers?: boolean })[]
  >([]);

  const [validDays, setValidDays] = useState<number>(30);
  const [shippingTerms, setShippingTerms] = useState<string>(
    'Ex-Works cluster workshop. Surface courier billed at actuals.'
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    '50% advance upon purchase order, 50% prior to dispatch.'
  );
  const [commercialNotes, setCommercialNotes] = useState<string>(
    'Handcrafted items may carry natural slight variations in finish, reflecting authentic artisanal craftsmanship.'
  );
  const [taxRatePercent, setTaxRatePercent] = useState<number>(0);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, quoteRes] = await Promise.all([
        productsApi.getAll().catch(() => ({ products: [] })),
        quotationsApi.getAll().catch(() => ({ quotations: [] })),
      ]);

      const prods = prodRes.products || [];
      setProducts(prods);
      setQuotations(quoteRes.quotations || []);

      // If user has products, pre-select the first product to jumpstart the quotation
      if (prods.length > 0 && selectedItems.length === 0) {
        const p = prods[0];
        setSelectedItems([
          {
            productId: p.id,
            title: p.title,
            sku: p.sku || `SKU-${p.id.slice(-5)}`,
            imageUrl: p.imageUrls?.[0],
            description: p.description,
            craftStory: p.craftStory,
            material: p.material || 'Handcrafted Natural',
            quantity: 10,
            moq: p.moq || 5,
            unitPrice: p.wholesalePrice || p.price,
            leadTime: p.leadTime || '7-10 business days',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load quotation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductLine = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (selectedItems.some((i) => i.productId === productId)) {
      setErrorMessage('This product is already added to the quotation.');
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        productId: prod.id,
        title: prod.title,
        sku: prod.sku || `SKU-${prod.id.slice(-5)}`,
        imageUrl: prod.imageUrls?.[0],
        description: prod.description,
        craftStory: prod.craftStory,
        material: prod.material || 'Handcrafted Natural',
        quantity: 10,
        moq: prod.moq || 5,
        unitPrice: prod.wholesalePrice || prod.price,
        leadTime: prod.leadTime || '7-10 business days',
      },
    ]);
  };

  const handleRemoveProductLine = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleUpdateItemField = (index: number, field: keyof QuotationItemInput, val: any) => {
    setSelectedItems(
      selectedItems.map((item, i) => {
        if (i !== index) return item;
        return { ...item, [field]: val };
      })
    );
  };

  // Tiered pricing toggle & add tier
  const handleToggleTieredPricing = (index: number) => {
    setSelectedItems(
      selectedItems.map((item, i) => {
        if (i !== index) return item;
        const enabled = !item.hasTiers;
        return {
          ...item,
          hasTiers: enabled,
          pricingTiers: enabled
            ? [
                { minQuantity: item.moq || 5, maxQuantity: 24, unitPrice: item.unitPrice },
                { minQuantity: 25, unitPrice: Math.round(item.unitPrice * 0.92) },
              ]
            : undefined,
        };
      })
    );
  };

  const handleUpdateTier = (
    itemIndex: number,
    tierIndex: number,
    field: keyof PricingTier,
    val: any
  ) => {
    setSelectedItems(
      selectedItems.map((item, i) => {
        if (i !== itemIndex || !item.pricingTiers) return item;
        const tiers = [...item.pricingTiers];
        tiers[tierIndex] = { ...tiers[tierIndex], [field]: val };
        return { ...item, pricingTiers: tiers };
      })
    );
  };

  // Dynamic live total calculation
  const subtotal = selectedItems.reduce((sum, item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    return sum + qty * price;
  }, 0);

  const taxAmount = taxRatePercent > 0 ? (subtotal * taxRatePercent) / 100 : 0;
  const grandTotal = subtotal + taxAmount;

  const handleGenerateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!buyer.name.trim()) {
      setErrorMessage('Please enter the buyer or company contact name.');
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMessage('Please select at least one product line for the quotation.');
      return;
    }

    for (const item of selectedItems) {
      if (!item.quantity || item.quantity <= 0) {
        setErrorMessage(`Quantity for "${item.title}" must be at least 1.`);
        return;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        setErrorMessage(`Wholesale unit price for "${item.title}" must be greater than zero.`);
        return;
      }
    }

    try {
      setGenerating(true);
      const res = await quotationsApi.create({
        buyer,
        items: selectedItems,
        validDays,
        commercialNotes,
        shippingTerms,
        paymentTerms,
        taxRatePercent,
      });

      const newQuote = res.quotation;
      setQuotations([newQuote, ...quotations]);

      // Automatically initiate PDF download
      await quotationsApi.downloadPdf(newQuote.id, newQuote.quotationNumber);

      setSuccessMessage(
        `Quotation #${newQuote.quotationNumber} generated successfully! PDF download started.`
      );
      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (err: any) {
      console.error('Quotation creation error:', err);
      setErrorMessage(err.message || 'Failed to create quotation.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    try {
      setDeletingId(id);
      await quotationsApi.delete(id);
      setQuotations(quotations.filter((q) => q.id !== id));
    } catch (err) {
      console.error('Delete quotation error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadExistingPdf = async (id: string, quoteNum: string) => {
    try {
      await quotationsApi.downloadPdf(id, quoteNum);
    } catch (err: any) {
      alert(err.message || 'Failed to download quotation PDF');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4 font-inter">
        <div className="w-10 h-10 border-3 border-[#0F5132] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-stone-600 dark:text-emerald-200">
          Loading wholesale products and quotations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter">
      {/* Toast Banners */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
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

      {/* Intro Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#13251B] border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#D4AF37]/20 text-[#8B6B15] dark:text-[#E8C863] rounded-full border border-[#D4AF37]/30 font-poppins uppercase">
              B2B Commerce
            </span>
            <span className="text-xs text-stone-500 dark:text-emerald-300/60 font-mono">
              Not an invoice • Formal wholesale offer
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-poppins text-stone-900 dark:text-white">
            B2B Craft Wholesale Quotation Generator
          </h2>
          <p className="text-xs text-stone-500 dark:text-emerald-300/70 max-w-2xl leading-relaxed">
            Generate formal, branded wholesale quotations for boutiques, retail buyers, gift shops, and corporate procurement teams with craft stories, MOQs, and tiered bulk pricing.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        /* Empty State */
        <div className="p-10 rounded-3xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/40 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/20 dark:border-emerald-800 flex items-center justify-center text-[#0F5132] dark:text-emerald-400">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold font-poppins text-stone-900 dark:text-white">
              No products available to quote
            </h3>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70 leading-relaxed">
              Add your handcrafted pieces in the Product Studio before issuing B2B wholesale quotations.
            </p>
          </div>
          <button
            onClick={onNavigateToProducts}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer"
          >
            <Package className="w-4 h-4" />
            Add Products to Catalog
          </button>
        </div>
      ) : (
        /* Quotation Builder Form */
        <form onSubmit={handleGenerateQuotation} className="space-y-8">
          {/* Step 1: Buyer Information */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/40 space-y-4 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
              1. Buyer / Inquirer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Buyer / Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={buyer.name}
                  onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Company / Boutique Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anaya Craft Boutique"
                  value={buyer.company || ''}
                  onChange={(e) => setBuyer({ ...buyer, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Buyer Email
                </label>
                <input
                  type="email"
                  placeholder="priya@anayaboutique.com"
                  value={buyer.email || ''}
                  onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Buyer Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={buyer.phone || ''}
                  onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Delivery Destination / Address
                </label>
                <input
                  type="text"
                  placeholder="Mumbai, Maharashtra"
                  value={buyer.address || ''}
                  onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Buyer GSTIN (Optional)
                </label>
                <input
                  type="text"
                  placeholder="27AAAAA0000A1Z5"
                  value={buyer.gstNumber || ''}
                  onChange={(e) => setBuyer({ ...buyer, gstNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Product Line Items */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/40 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                  2. Quotation Line Items ({selectedItems.length})
                </h3>
                <p className="text-xs text-stone-500 dark:text-emerald-300/70">
                  Specify wholesale units, MOQs, negotiated unit pricing, and production lead times.
                </p>
              </div>

              {/* Add Product Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddProductLine(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-xs px-3 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/60 text-stone-800 dark:text-emerald-200 outline-none cursor-pointer"
                >
                  <option value="">+ Add Product from Catalog...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (₹{p.wholesalePrice || p.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedItems.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-emerald-300/60 italic py-4">
                No items added to quotation yet. Use the dropdown above to add products.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-stone-200 dark:border-emerald-900/40 bg-stone-50/50 dark:bg-emerald-950/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-stone-200 dark:bg-emerald-950 shrink-0 overflow-hidden flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold font-poppins text-stone-900 dark:text-white">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-emerald-300/60 font-mono">
                            <span>{item.sku}</span>
                            <span>•</span>
                            <span>{item.material}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProductLine(index)}
                        className="text-stone-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Numeric Inputs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 dark:text-emerald-200">
                          MOQ (Min Order)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.moq}
                          onChange={(e) =>
                            handleUpdateItemField(index, 'moq', parseInt(e.target.value, 10) || 1)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#13251B] text-stone-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 dark:text-emerald-200">
                          Order Qty <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItemField(
                              index,
                              'quantity',
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#13251B] text-stone-900 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 dark:text-emerald-200">
                          Wholesale Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateItemField(
                              index,
                              'unitPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#13251B] text-stone-900 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 dark:text-emerald-200">
                          Production Lead Time
                        </label>
                        <input
                          type="text"
                          value={item.leadTime || '7-10 days'}
                          onChange={(e) => handleUpdateItemField(index, 'leadTime', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#13251B] text-stone-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Tiered Pricing Toggle */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleTieredPricing(index)}
                        className="text-[11px] font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {item.hasTiers ? 'Remove Tiered Pricing' : '+ Add Tiered Wholesale Pricing'}
                      </button>

                      <div className="text-right font-poppins text-xs font-bold text-stone-900 dark:text-white">
                        Line Total: ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Tiered Pricing Editor */}
                    {item.hasTiers && item.pricingTiers && (
                      <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-emerald-950/60 border border-stone-200 dark:border-emerald-800/60 space-y-2 text-xs">
                        <span className="font-bold text-stone-800 dark:text-emerald-200 block text-[11px]">
                          Tiered Pricing Tiers:
                        </span>
                        {item.pricingTiers.map((tier, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <span className="text-stone-500 dark:text-emerald-300/70">
                              Qty {tier.minQuantity}
                              {tier.maxQuantity ? ` - ${tier.maxQuantity}` : '+'}:
                            </span>
                            <span className="font-semibold">₹</span>
                            <input
                              type="number"
                              value={tier.unitPrice}
                              onChange={(e) =>
                                handleUpdateTier(
                                  index,
                                  tIdx,
                                  'unitPrice',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 px-2 py-1 rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-[#13251B] text-stone-900 dark:text-white text-xs font-bold"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Commercial Terms & Notes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800/40 space-y-4 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
              3. Commercial Terms & Quotation Validity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Quotation Validity (Days)
                </label>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value={7}>7 Days</option>
                  <option value={15}>15 Days</option>
                  <option value={30}>30 Days (Standard)</option>
                  <option value={60}>60 Days</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Applicable GST / Tax Rate (%)
                </label>
                <select
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value={0}>0% (Tax Not Applied / Ex-Tax)</option>
                  <option value={5}>5% (Handicrafts / Handloom)</option>
                  <option value={12}>12% (Standard Craft GST)</option>
                  <option value={18}>18% (Commercial / Brass / Metalcraft)</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Packaging & Shipping Terms
                </label>
                <input
                  type="text"
                  value={shippingTerms}
                  onChange={(e) => setShippingTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-stone-700 dark:text-emerald-200">
                  Artisan Notes / Craft Story Disclaimer
                </label>
                <textarea
                  rows={2}
                  value={commercialNotes}
                  onChange={(e) => setCommercialNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-white outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Summary Card & Action */}
          <div className="p-6 rounded-3xl bg-[#0F5132]/5 dark:bg-emerald-950/40 border border-[#0F5132]/20 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left w-full sm:w-auto">
              <div className="text-xs text-stone-500 dark:text-emerald-300/70">
                Subtotal: ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                {taxAmount > 0 && (
                  <span>
                    {' '}
                    + Tax ({taxRatePercent}%): ₹
                    {taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold font-poppins text-stone-900 dark:text-white flex items-center justify-center sm:justify-start gap-1">
                <span className="text-[#0F5132] dark:text-emerald-400">Total:</span> ₹
                {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button
              type="submit"
              disabled={generating || selectedItems.length === 0}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all font-poppins flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Wholesale Quotation (PDF)
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Past Issued Quotations History */}
      {quotations.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-emerald-900/40">
          <h3 className="text-base font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
            Issued Wholesale Quotations History ({quotations.length})
          </h3>

          <div className="border border-stone-200 dark:border-emerald-900/40 rounded-2xl overflow-x-auto bg-white dark:bg-[#13251B]">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-emerald-950/80 text-stone-700 dark:text-emerald-200 font-semibold border-b border-stone-200 dark:border-emerald-900/40">
                <tr>
                  <th className="p-3">Quote #</th>
                  <th className="p-3">Buyer / Company</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Valid Until</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-emerald-900/30">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-stone-50 dark:hover:bg-emerald-950/30">
                    <td className="p-3 font-mono font-bold text-stone-900 dark:text-white whitespace-nowrap">
                      {q.quotationNumber}
                    </td>
                    <td className="p-3 font-medium text-stone-900 dark:text-white">
                      {q.buyer.name}
                      {q.buyer.company && (
                        <span className="text-stone-500 dark:text-emerald-300/70 block text-[11px]">
                          {q.buyer.company}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-stone-500 dark:text-emerald-300/70 whitespace-nowrap">
                      {q.createdAt.slice(0, 10)}
                    </td>
                    <td className="p-3 text-stone-500 dark:text-emerald-300/70 whitespace-nowrap">
                      {q.validUntil}
                    </td>
                    <td className="p-3 font-bold text-stone-900 dark:text-white whitespace-nowrap">
                      {q.currency} {q.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleDownloadExistingPdf(q.id, q.quotationNumber)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F5132]/10 hover:bg-[#0F5132]/20 text-[#0F5132] dark:text-emerald-300 dark:bg-emerald-950 dark:hover:bg-emerald-900 font-semibold cursor-pointer text-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => handleDeleteQuotation(q.id)}
                        disabled={deletingId === q.id}
                        className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete quotation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
