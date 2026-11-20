import React, { useEffect, useRef } from 'react';
import { Edit2, X } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext';
import type { Product } from '../types';
import { getFallbackCraftThumbnail, getProductThumbnail } from '../utils/productThumbnail';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

export function ProductDetails({ product, onClose, onEdit }: ProductDetailsProps) {
  const { t, formatCurrency, formatNumber } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const photos = [...new Set([getProductThumbnail(product), ...(Array.isArray(product.imageUrls) ? product.imageUrls.filter(url => typeof url === 'string' && url.trim()) : [])])];
  const statusLabel = product.status === 'archived' ? 'statusArchived' : product.status === 'draft' ? 'statusDraft' : 'statusPublished';
  const fields = [
    ['product.tablePrice', formatCurrency(product.price, product.currency || 'INR')],
    ['product.tableStock', product.stock == null ? undefined : formatNumber(product.stock)],
    ['product.tableCategory', product.category],
    ['common.status', t('product.' + statusLabel)],
    ['product.skuLabel', product.sku],
    ['product.materialsLabel', product.material],
    ['product.weightLabel', product.weight],
    ['product.dimensionsLabel', product.dimensions],
  ];

  return (
    <dialog ref={dialogRef} aria-labelledby="listing-title"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      className="m-auto w-[calc(100%-1.5rem)] max-w-xl max-h-[90dvh] overflow-hidden rounded-2xl bg-white text-stone-900 dark:bg-[#13251B] dark:text-white shadow-xl backdrop:bg-black/65">
      <div className="flex max-h-[90dvh] flex-col">
        <header className="shrink-0 flex items-center gap-3 border-b border-stone-200 dark:border-emerald-900 px-4 py-2">
          <h2 id="listing-title" className="max-h-[20dvh] overflow-auto min-w-0 flex-1 break-words font-poppins font-bold">{product.title}</h2>
          <button type="button" autoFocus onClick={onClose} aria-label={t('common.close')} className="grid size-11 shrink-0 place-items-center rounded-xl"><X size={20} /></button>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2">
            {photos.map((url, index) => (
              <img key={url} src={url} alt={product.title + ' (' + (index + 1) + '/' + photos.length + ')'}
                loading={index === 0 ? 'eager' : 'lazy'} decoding="async"
                onError={event => {
                  const fallback = getFallbackCraftThumbnail(product);
                  if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                }}
                className="aspect-[4/3] max-h-64 w-full shrink-0 snap-center object-contain rounded-xl bg-stone-100 dark:bg-[#0E2016]" />
            ))}
          </div>
          {product.description && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{product.description}</p>}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {fields.map(([key, value]) => value ? (
              <div key={key} className="min-w-0"><dt className="text-xs text-stone-500 dark:text-emerald-300">{t(key)}</dt><dd className="break-words font-medium">{value}</dd></div>
            ) : null)}
          </dl>
          {Array.isArray(product.keywords) && <p className="break-words text-sm">{product.keywords.map(word => '#' + word).join(' ')}</p>}
        </div>
        <footer className="shrink-0 border-t border-stone-200 dark:border-emerald-900 p-3">
          <button type="button" onClick={onEdit} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-4 font-semibold text-white"><Edit2 size={16} />{t('product.editProduct')}</button>
        </footer>
      </div>
    </dialog>
  );
}
