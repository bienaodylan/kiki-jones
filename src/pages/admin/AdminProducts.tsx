import React, { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Archive, Check, X, Upload } from 'lucide-react';
import { Category, Product, ProductStatus, ProductVariant } from '../../types/commerce';
import { formatXOF, getColorHex, sanitizeId, slugify, getProductTotalAvailable } from '../../lib/format';
import { saveProductAndVariants, deleteProductAdmin } from '../../lib/firestoreService';
import { KIKI_JONES_IMAGES } from '../../lib/catalogDefaults';
import { uploadAdminImage } from '../../lib/imageUpload';
import { detectDominantColorsFromImageUrl, DetectedColor } from '../../lib/colorDetector';

interface AdminProductsProps {
  products: Product[];
  variants: ProductVariant[];
  categories: Category[];
  actorEmail: string;
  onOpenImport: () => void;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

interface ColorEntry {
  name: string;
  hex: string;
  imageIndex: number;
}

export function AdminProducts({
  products,
  variants,
  categories,
  actorEmail,
  onOpenImport,
  onToast,
}: AdminProductsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [colorEntries, setColorEntries] = useState<ColorEntry[]>([]);
  const [newColorInput, setNewColorInput] = useState('');
  const [scanningColors, setScanningColors] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: categories[0]?.id || 'cat_women',
    sku: '',
    imagesText: KIKI_JONES_IMAGES.womenEditorial,
    runwayModelImageUrl: '',
    regularPriceXof: 25000,
    promoPriceXof: '',
    lowStockThreshold: 5,
    status: 'published' as ProductStatus,
    isNewDrop: false,
    newDropOrder: 10,
    isFeatured: false,
    featuredOrder: 10,
    isPreorder: false,
    preorderLimit: '',
    preorderEstimateDate: '',
    seoTitle: '',
    seoDescription: '',
  });

  const [variantRows, setVariantRows] = useState<
    { id: string; color: string; colorHex: string; size: string; sku: string; priceXof: number; stockQty: number; isActive: boolean }[]
  >([]);

  const productImagesList = form.imagesText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const syncVariantsFromColors = (
    colors: ColorEntry[],
    baseSku: string,
    priceXof: number
  ) => {
    if (colors.length === 0) {
      setVariantRows([]);
      return;
    }
    setVariantRows((prev) => {
      const existingSizes = Array.from(new Set(prev.map((r) => r.size).filter(Boolean)));
      const sizesToUse = existingSizes.length > 0 ? existingSizes : ['S', 'M', 'L'];
      const cleanSku = (baseSku || 'MRZ').trim();
      const nextRows: typeof prev = [];
      colors.forEach((c) => {
        sizesToUse.forEach((sz) => {
          const existingMatch = prev.find((r) => r.color === c.name && r.size === sz);
          nextRows.push(
            existingMatch
              ? { ...existingMatch, colorHex: c.hex }
              : {
                  id: sanitizeId(`var_${cleanSku}_${c.name}_${sz}_${Date.now()}`),
                  color: c.name,
                  colorHex: c.hex,
                  size: sz,
                  sku: `${cleanSku}-${c.name.slice(0, 3).toUpperCase()}-${sz.toUpperCase()}`,
                  priceXof: Number(priceXof) || 25000,
                  stockQty: 8,
                  isActive: true,
                }
          );
        });
      });
      return nextRows;
    });
  };

  // Detect dominant candidates automatically when creating a new product from its image
  useEffect(() => {
    if (!editorOpen || editingId) return;
    const firstImg = productImagesList[0];
    if (!firstImg) return;
    let cancelled = false;
    setScanningColors(true);
    detectDominantColorsFromImageUrl(firstImg, 4).then((cols) => {
      if (cancelled) return;
      setScanningColors(false);
      if (cols.length > 0) {
        const entries: ColorEntry[] = cols.map((c, idx) => ({
          name: c.name,
          hex: c.hex,
          imageIndex: idx < productImagesList.length ? idx : 0,
        }));
        setColorEntries(entries);
        syncVariantsFromColors(entries, form.sku, form.regularPriceXof);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [editorOpen, editingId, form.imagesText]);

  const handleScanImageColors = async () => {
    const targetImg = productImagesList[0];
    if (!targetImg) return;
    setScanningColors(true);
    const cols: DetectedColor[] = await detectDominantColorsFromImageUrl(targetImg, 4);
    setScanningColors(false);
    if (cols.length > 0) {
      const entries: ColorEntry[] = cols.map((c, idx) => ({
        name: c.name,
        hex: c.hex,
        imageIndex: idx < productImagesList.length ? idx : 0,
      }));
      setColorEntries(entries);
      syncVariantsFromColors(entries, form.sku, form.regularPriceXof);
    }
  };

  const handleRemoveColorEntry = (colorName: string) => {
    const nextEntries = colorEntries.filter((c) => c.name !== colorName);
    setColorEntries(nextEntries);
    setVariantRows((prev) => prev.filter((v) => v.color !== colorName));
  };

  const handleRenameColorEntry = (idx: number, nextName: string) => {
    const oldName = colorEntries[idx]?.name;
    if (!oldName) return;
    const nextHex = getColorHex(nextName);
    setColorEntries((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, name: nextName, hex: nextHex } : c))
    );
    setVariantRows((prev) =>
      prev.map((v) =>
        v.color === oldName ? { ...v, color: nextName, colorHex: nextHex } : v
      )
    );
  };

  const handleAddManualColor = () => {
    const clean = newColorInput.trim();
    if (!clean) return;
    if (colorEntries.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      setNewColorInput('');
      return;
    }
    const nextEntry: ColorEntry = {
      name: clean,
      hex: getColorHex(clean),
      imageIndex: Math.min(colorEntries.length, Math.max(0, productImagesList.length - 1)),
    };
    const nextEntries = [...colorEntries, nextEntry];
    setColorEntries(nextEntries);
    syncVariantsFromColors(nextEntries, form.sku, form.regularPriceXof);
    setNewColorInput('');
  };

  const handleAssignColorImage = async (colorIdx: number, file: File) => {
    setUploadingImage(true);
    try {
      const url = await uploadAdminImage(file);
      const imgs = [...productImagesList];
      while (imgs.length <= colorIdx) {
        imgs.push(url);
      }
      imgs[colorIdx] = url;
      setForm((prev) => ({ ...prev, imagesText: imgs.join('\n') }));
      setColorEntries((prev) =>
        prev.map((c, i) => (i === colorIdx ? { ...c, imageIndex: colorIdx } : c))
      );
      onToast('Photo associée à la couleur.', 'success');
    } catch (err: any) {
      onToast(err?.message || 'Unable to upload photo.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    const defaultCat = categories[0];
    const generatedSku = `KJ-${String(Date.now()).slice(-4)}`;
    setForm({
      name: '',
      slug: '',
      description: '',
      categoryId: defaultCat?.id || 'cat_women',
      sku: generatedSku,
      imagesText: KIKI_JONES_IMAGES.womenEditorial,
      runwayModelImageUrl: '',
      regularPriceXof: 28000,
      promoPriceXof: '',
      lowStockThreshold: 5,
      status: 'published',
      isNewDrop: false,
      newDropOrder: 7,
      isFeatured: false,
      featuredOrder: 5,
      isPreorder: false,
      preorderLimit: '',
      preorderEstimateDate: '',
      seoTitle: '',
      seoDescription: '',
    });
    setColorEntries([]);
    setVariantRows([]);
    setNewColorInput('');
    setEditorOpen(true);
  };

  const openEdit = (prod: Product) => {
    setEditingId(prod.id);
    setForm({
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      categoryId: prod.categoryId,
      sku: prod.sku,
      imagesText: (prod.images || []).join('\n'),
      runwayModelImageUrl: prod.runwayModelImageUrl || '',
      regularPriceXof: prod.regularPriceXof,
      promoPriceXof: prod.promoPriceXof ? String(prod.promoPriceXof) : '',
      lowStockThreshold: prod.lowStockThreshold ?? 5,
      status: prod.status,
      isNewDrop: Boolean(prod.isNewDrop),
      newDropOrder: prod.newDropOrder ?? 99,
      isFeatured: Boolean(prod.isFeatured),
      featuredOrder: prod.featuredOrder ?? 99,
      isPreorder: Boolean(prod.isPreorder),
      preorderLimit: prod.preorderLimit ? String(prod.preorderLimit) : '',
      preorderEstimateDate: prod.preorderEstimateDate || '',
      seoTitle: prod.seoTitle || '',
      seoDescription: prod.seoDescription || '',
    });
    const pVars = variants.filter((v) => v.productId === prod.id);
    setVariantRows(
      pVars.map((v) => ({
        id: v.id,
        color: v.color,
        colorHex: v.colorHex || getColorHex(v.color),
        size: v.size,
        sku: v.sku,
        priceXof: v.priceXof,
        stockQty: v.stockQty,
        isActive: v.isActive,
      }))
    );
    const uniqueColors = Array.from(
      new Map(pVars.map((v) => [v.color, v.colorHex || getColorHex(v.color)])).entries()
    );
    setColorEntries(
      uniqueColors.map(([name, hex], idx) => ({
        name,
        hex,
        imageIndex: idx < (prod.images?.length || 0) ? idx : 0,
      }))
    );
    setNewColorInput('');
    setEditorOpen(true);
  };

  const handleDuplicate = async (prod: Product) => {
    const pVars = variants.filter((v) => v.productId === prod.id);
    const newSlug = `${prod.slug}-copy-${String(Date.now()).slice(-3)}`;
    const newSku = `${prod.sku}-CPY`;
    await saveProductAndVariants(
      null,
      {
        ...prod,
        name: `${prod.name} (Copy)`,
        slug: newSlug,
        sku: newSku,
        status: 'draft',
        isNewDrop: false,
        isFeatured: false,
      },
      pVars.map((v, idx) => ({
        id: sanitizeId(`var_${newSku}_${idx}_${Date.now()}`),
        productId: '',
        sku: `${v.sku}-CPY`,
        color: v.color,
        colorHex: getColorHex(v.color),
        size: v.size,
        priceXof: v.priceXof,
        compareAtPriceXof: v.compareAtPriceXof ?? null,
        stockQty: v.stockQty,
        reservedQty: 0,
        lowStockThreshold: v.lowStockThreshold,
        weightGrams: v.weightGrams ?? 250,
        isActive: v.isActive,
      })),
      actorEmail
    );
    onToast(`Duplicated ${prod.name} as draft.`, 'success');
  };

  const handleQuickStatus = async (prod: Product, nextStatus: ProductStatus) => {
    const pVars = variants.filter((v) => v.productId === prod.id);
    await saveProductAndVariants(
      prod.id,
      { ...prod, status: nextStatus },
      pVars,
      actorEmail
    );
    onToast(`${prod.name} marked ${nextStatus}.`, 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const cat = categories.find((c) => c.id === form.categoryId);
      const images = form.imagesText
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);

      // Reorder leading images to match colorEntries order if multiple colors & images exist
      const orderedImages = [...images];
      colorEntries.forEach((ce, idx) => {
        const srcUrl = images[ce.imageIndex];
        if (srcUrl && idx < orderedImages.length && orderedImages[idx] !== srcUrl) {
          const currentPos = orderedImages.indexOf(srcUrl);
          if (currentPos >= 0) {
            const tmp = orderedImages[idx];
            orderedImages[idx] = orderedImages[currentPos];
            orderedImages[currentPos] = tmp;
          }
        }
      });

      const colors = Array.from(new Set(variantRows.map((v) => v.color)));
      const sizes = Array.from(new Set(variantRows.map((v) => v.size)));
      const promoNum = form.promoPriceXof ? Math.round(Number(form.promoPriceXof)) : null;

      await saveProductAndVariants(
        editingId,
        {
          name: form.name.trim(),
          slug: slugify(form.slug || form.name),
          description: form.description.trim(),
          categoryId: form.categoryId,
          categoryName: cat?.name || 'Clothing',
          sku: form.sku.trim(),
          images: orderedImages,
          runwayModelImageUrl: form.runwayModelImageUrl.trim() || null,
          colors,
          sizes,
          regularPriceXof: Math.round(Number(form.regularPriceXof)),
          promoPriceXof: promoNum,
          lowStockThreshold: Math.round(Number(form.lowStockThreshold)),
          status: form.status,
          isNewDrop: form.isNewDrop,
          newDropOrder: Math.round(Number(form.newDropOrder)),
          isFeatured: form.isFeatured,
          featuredOrder: Math.round(Number(form.featuredOrder)),
          isPreorder: form.isPreorder,
          preorderLimit: form.preorderLimit ? Math.round(Number(form.preorderLimit)) : null,
          preorderEstimateDate: form.preorderEstimateDate || null,
          seoTitle: form.seoTitle || `${form.name.trim()} — KIKI JONES`,
          seoDescription: form.seoDescription || form.description.slice(0, 155),
        },
        variantRows.map((v) => ({
          id: v.id,
          productId: editingId || '',
          sku: v.sku,
          color: v.color,
          colorHex: v.colorHex || getColorHex(v.color),
          size: v.size,
          priceXof: Math.round(Number(v.priceXof)),
          compareAtPriceXof: promoNum ? Math.round(Number(form.regularPriceXof)) : null,
          stockQty: Math.round(Number(v.stockQty)),
          reservedQty: 0,
          lowStockThreshold: Math.round(Number(form.lowStockThreshold)),
          weightGrams: 250,
          isActive: v.isActive,
        })),
        actorEmail
      );
      setEditorOpen(false);
      onToast('Product & variants saved to Firestore.', 'success');
    } catch (err: any) {
      onToast(err?.message || 'Error saving product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl text-black">Product Catalog</h1>
          <p className="text-xs font-light text-black/60 mt-0.5">
            Manage products, New Drop assignments, Featured placement, variants, and XOF pricing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenImport}
            className="px-4 py-2.5 rounded-none bg-white text-black text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2 hover:bg-black hover:text-white cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Import Center</span>
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="px-5 py-2.5 rounded-none bg-black text-white text-xs font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Filters — Strictly Square */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <input
          type="search"
          placeholder="Search product name, SKU, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-80 rounded-none bg-white px-4 py-2 text-xs font-light focus:outline-none"
        />
        <div className="flex gap-1 bg-white p-1">
          {['all', 'published', 'draft', 'archived'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-none text-xs uppercase tracking-[0.12em] cursor-pointer ${
                statusFilter === st ? 'bg-black text-white font-bold' : 'text-black/60 font-light'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Frameless Table with Adaptive Image Frames */}
      <div className="bg-white overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4 text-right">Available</th>
              <th className="py-3 px-4">Collections</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => {
              const pVars = variants.filter((v) => v.productId === p.id);
              const stock = getProductTotalAvailable(pVars);
              return (
                <tr
                  key={p.id}
                  className={`hover:bg-black/[0.04] ${idx % 2 === 1 ? 'bg-black/[0.015]' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 bg-[#F7F7F7] rounded-none shrink-0 overflow-hidden">
                        {p.images?.[0] && (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-auto block"
                          />
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="font-bold text-black hover:underline text-left cursor-pointer"
                        >
                          {p.name}
                        </button>
                        <div className="text-[11px] font-light text-black/60">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-light">{p.categoryName}</td>
                  <td className="py-3 px-4 font-bold tabular-nums">
                    {formatXOF(p.promoPriceXof || p.regularPriceXof)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {stock} ({pVars.length} vars)
                  </td>
                  <td className="py-3 px-4 text-[11px] font-light text-black/60">
                    {[
                      p.isNewDrop ? `New Drop #${p.newDropOrder}` : '',
                      p.isFeatured ? `Featured #${p.featuredOrder}` : '',
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[11px]">{p.status}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="px-2.5 py-1 rounded-none bg-[#F7F7F7] font-bold hover:bg-black hover:text-white cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        title="Duplicate"
                        onClick={() => handleDuplicate(p)}
                        className="p-1.5 rounded-none text-black/60 hover:text-black cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {p.status !== 'published' ? (
                        <button
                          type="button"
                          title="Publish"
                          onClick={() => handleQuickStatus(p, 'published')}
                          className="p-1.5 rounded-none text-black/60 hover:text-black cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Archive"
                          onClick={() => handleQuickStatus(p, 'archived')}
                          className="p-1.5 rounded-none text-black/60 hover:text-black cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => deleteProductAdmin(p.id, actorEmail)}
                        className="p-1.5 rounded-none text-black/60 hover:text-black cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Editor Drawer — Strictly Square, Zero Frames & Demarcation Lines */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditorOpen(false)} />
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-3xl bg-white h-full overflow-y-auto p-6 md:p-8 space-y-6 rounded-none"
          >
            <div className="flex items-center justify-between pb-2">
              <h2 className="font-editorial text-2xl text-black">
                {editingId ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-2 rounded-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Name *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 focus:outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Slug</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated-from-name"
                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 focus:outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Base SKU *</span>
                <input
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 focus:outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Category</span>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Regular Price (XOF)</span>
                <input
                  type="number"
                  required
                  value={form.regularPriceXof}
                  onChange={(e) => setForm({ ...form, regularPriceXof: Number(e.target.value) })}
                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 tabular-nums focus:outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Promo Price (XOF)</span>
                <input
                  type="number"
                  value={form.promoPriceXof}
                  onChange={(e) => setForm({ ...form, promoPriceXof: e.target.value })}
                  placeholder="Optional"
                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 tabular-nums focus:outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Publication Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="font-bold uppercase tracking-wider text-black/60">Low-Stock Threshold</span>
                <input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 tabular-nums focus:outline-none"
                />
              </label>
            </div>

            <label className="block space-y-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-black/60">Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 font-light focus:outline-none"
              />
            </label>

            {/* Images Section — Adaptive Previews */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold uppercase tracking-wider text-black/60">
                  Images ({productImagesList.length})
                </span>
                <label className="px-3 py-1.5 rounded-none bg-black text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer hover:bg-black/85">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      setUploadingImage(true);
                      try {
                        const uploadedUrls: string[] = [];
                        for (const f of files) {
                          const url = await uploadAdminImage(f);
                          uploadedUrls.push(url);
                        }
                        const nextImages = [...uploadedUrls, ...productImagesList];
                        setForm((prev) => ({
                          ...prev,
                          imagesText: nextImages.join('\n'),
                        }));
                        setScanningColors(true);
                        const detected = await detectDominantColorsFromImageUrl(uploadedUrls[0], 4);
                        setScanningColors(false);
                        if (detected.length > 0) {
                          const entries: ColorEntry[] = detected.map((c, idx) => ({
                            name: c.name,
                            hex: c.hex,
                            imageIndex: idx < nextImages.length ? idx : 0,
                          }));
                          setColorEntries(entries);
                          syncVariantsFromColors(entries, form.sku, form.regularPriceXof);
                        }
                        onToast(`${uploadedUrls.length} photo(s) ajoutée(s).`, 'success');
                      } catch (err: any) {
                        onToast(err?.message || 'Unable to upload product photo.', 'error');
                      } finally {
                        setUploadingImage(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>

              {/* Adaptive Gallery Preview Grid */}
              {productImagesList.length > 0 && (
                <div className="flex flex-wrap gap-2 items-start">
                  {productImagesList.map((imgUrl, idx) => (
                    <div key={`${imgUrl}-${idx}`} className="relative w-24 bg-[#F7F7F7] rounded-none overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={`Preview ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto block"
                      />
                      <button
                        type="button"
                        title="Supprimer image"
                        onClick={() => {
                          const remaining = productImagesList.filter((_, i) => i !== idx);
                          setForm((prev) => ({ ...prev, imagesText: remaining.join('\n') }));
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-none bg-black text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                rows={2}
                value={form.imagesText}
                onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2.5 font-light focus:outline-none"
              />
            </div>

            {/* SHEIN-style Color Manager — Worn Garment Thumbnail + Dominant Identification + Delete × */}
            <div className="bg-[#F7F7F7] p-4 space-y-3 text-xs rounded-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold uppercase tracking-wider text-black">
                  Couleurs ({colorEntries.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={scanningColors || productImagesList.length === 0}
                    onClick={handleScanImageColors}
                    className="px-3 py-1.5 rounded-none bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black/85 cursor-pointer disabled:opacity-40"
                  >
                    {scanningColors ? 'Analyse...' : 'Identifier sur l’image'}
                  </button>
                </div>
              </div>

              {colorEntries.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {colorEntries.map((entry, idx) => {
                    const thumbUrl = productImagesList[entry.imageIndex] || productImagesList[0] || '';
                    return (
                      <div
                        key={`${entry.name}-${idx}`}
                        className="relative bg-white p-2 rounded-none flex flex-col gap-2"
                      >
                        <button
                          type="button"
                          title="Supprimer cette couleur"
                          aria-label={`Supprimer ${entry.name}`}
                          onClick={() => handleRemoveColorEntry(entry.name)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-none bg-black text-white flex items-center justify-center hover:bg-black/80 cursor-pointer z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        {/* Adaptive Garment Thumbnail for this Color */}
                        <div className="flex items-start gap-2">
                          <label
                            title="Cliquer pour associer une photo portée"
                            className="w-14 bg-[#F7F7F7] rounded-none overflow-hidden shrink-0 cursor-pointer block"
                          >
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={entry.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-auto block"
                              />
                            ) : (
                              <div
                                className="w-14 h-14 rounded-none"
                                style={{ backgroundColor: entry.hex }}
                              />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingImage}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAssignColorImage(idx, file);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          <div className="flex-1 min-w-0 pr-5 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-3 h-3 rounded-none shrink-0"
                                style={{ backgroundColor: entry.hex }}
                              />
                              <span className="text-[10px] font-light text-black/55">
                                #{idx + 1}
                              </span>
                            </div>
                            <input
                              value={entry.name}
                              onChange={(e) => handleRenameColorEntry(idx, e.target.value)}
                              className="w-full rounded-none bg-[#F7F7F7] px-2 py-1 text-[11px] font-bold text-black focus:outline-none"
                            />
                            {productImagesList.length > 1 && (
                              <select
                                value={entry.imageIndex}
                                onChange={(e) => {
                                  const nextImgIdx = Number(e.target.value);
                                  setColorEntries((prev) =>
                                    prev.map((c, i) =>
                                      i === idx ? { ...c, imageIndex: nextImgIdx } : c
                                    )
                                  );
                                }}
                                className="w-full rounded-none bg-[#F7F7F7] px-1.5 py-1 text-[10px] font-light focus:outline-none"
                              >
                                {productImagesList.map((_, pIdx) => (
                                  <option key={pIdx} value={pIdx}>
                                    Image #{pIdx + 1}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add color manually */}
              <div className="flex gap-2">
                <input
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  placeholder="Ajouter une couleur (ex: Rouge Corail)..."
                  className="flex-1 rounded-none bg-white px-3 py-2 text-xs font-light focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddManualColor}
                  className="px-4 py-2 rounded-none bg-black text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Collections & Pre-Order — Square, Zero Borders */}
            <div className="bg-[#F7F7F7] p-4 space-y-4 text-xs rounded-none">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isNewDrop}
                      onChange={(e) => setForm({ ...form, isNewDrop: e.target.checked })}
                      className="accent-black"
                    />
                    <span>Nouvelle Collection (Défilé Accueil)</span>
                  </label>
                  {form.isNewDrop && (
                    <input
                      type="number"
                      placeholder="Ordre d’affichage"
                      value={form.newDropOrder}
                      onChange={(e) => setForm({ ...form, newDropOrder: Number(e.target.value) })}
                      className="w-full rounded-none bg-white px-2.5 py-1.5 focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="accent-black"
                    />
                    <span>Featured on Homepage</span>
                  </label>
                  {form.isFeatured && (
                    <input
                      type="number"
                      placeholder="Order"
                      value={form.featuredOrder}
                      onChange={(e) => setForm({ ...form, featuredOrder: Number(e.target.value) })}
                      className="w-full rounded-none bg-white px-2.5 py-1.5 focus:outline-none"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPreorder}
                      onChange={(e) => setForm({ ...form, isPreorder: e.target.checked })}
                      className="accent-black"
                    />
                    <span>Enable Pre-Order</span>
                  </label>
                  {form.isPreorder && (
                    <input
                      type="text"
                      placeholder="Est. date (e.g. Dec 15)"
                      value={form.preorderEstimateDate}
                      onChange={(e) => setForm({ ...form, preorderEstimateDate: e.target.value })}
                      className="w-full rounded-none bg-white px-2.5 py-1.5 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Runway Mannequin Photo for Nouvelle Collection Showcase */}
              <div className="bg-white p-3.5 space-y-2.5 rounded-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-black block">
                      Photo Mannequin Défilé (Nouvelle Collection — Fond Blanc)
                    </span>
                    <span className="text-[11px] font-light text-black/55">
                      Affichée automatiquement dans le carrousel de mannequins sur la page d’accueil dès que « Nouvelle Collection » est coché.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-none bg-black text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer hover:bg-black/85">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Upload...' : 'Importer Mannequin'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImage(true);
                          try {
                            const url = await uploadAdminImage(file);
                            setForm((prev) => ({
                              ...prev,
                              runwayModelImageUrl: url,
                              isNewDrop: true,
                            }));
                            onToast('Photo mannequin ajoutée au défilé Nouvelle Collection.', 'success');
                          } catch (err: any) {
                            onToast(err?.message || 'Impossible d’importer la photo mannequin.', 'error');
                          } finally {
                            setUploadingImage(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                    {form.runwayModelImageUrl && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, runwayModelImageUrl: '' }))}
                        className="px-2.5 py-1.5 rounded-none bg-[#F7F7F7] text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white cursor-pointer"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {form.runwayModelImageUrl && (
                    <div className="w-20 bg-white rounded-none overflow-hidden shrink-0">
                      <img
                        src={form.runwayModelImageUrl}
                        alt="Mannequin défilé"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto block"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="URL de la photo mannequin studio fond neutre"
                    value={form.runwayModelImageUrl}
                    onChange={(e) => setForm({ ...form, runwayModelImageUrl: e.target.value })}
                    className="flex-1 rounded-none bg-[#F7F7F7] px-3 py-2 text-xs font-light focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Variants Matrix — Square, Zero Borders */}
            <div className="bg-[#F7F7F7] p-4 space-y-3 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-black/60">
                  Sellable Variants ({variantRows.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setVariantRows((prev) => [
                      ...prev,
                      {
                        id: sanitizeId(`var_${Date.now()}_${prev.length}`),
                        color: colorEntries[0]?.name || 'Noir',
                        colorHex: colorEntries[0]?.hex || '#000000',
                        size: 'M',
                        sku: `${form.sku || 'MRZ'}-${prev.length + 1}`,
                        priceXof: form.regularPriceXof,
                        stockQty: 5,
                        isActive: true,
                      },
                    ])
                  }
                  className="text-xs font-bold px-3 py-1 rounded-none bg-black text-white cursor-pointer"
                >
                  + Add Variant
                </button>
              </div>
              <div className="space-y-2">
                {variantRows.map((v, idx) => (
                  <div key={v.id} className="grid grid-cols-6 gap-2 text-xs items-center">
                    <input
                      value={v.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariantRows((rows) =>
                          rows.map((r, i) =>
                            i === idx ? { ...r, color: val, colorHex: getColorHex(val) } : r
                          )
                        );
                      }}
                      placeholder="Color"
                      className="rounded-none bg-white px-2 py-1.5 focus:outline-none"
                    />
                    <input
                      value={v.size}
                      onChange={(e) =>
                        setVariantRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, size: e.target.value } : r))
                        )
                      }
                      placeholder="Size"
                      className="rounded-none bg-white px-2 py-1.5 focus:outline-none"
                    />
                    <input
                      value={v.sku}
                      onChange={(e) =>
                        setVariantRows((rows) =>
                          rows.map((r, i) => (i === idx ? { ...r, sku: e.target.value } : r))
                        )
                      }
                      placeholder="SKU"
                      className="rounded-none bg-white px-2 py-1.5 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={v.priceXof}
                      onChange={(e) =>
                        setVariantRows((rows) =>
                          rows.map((r, i) =>
                            i === idx ? { ...r, priceXof: Number(e.target.value) } : r
                          )
                        )
                      }
                      placeholder="Price"
                      className="rounded-none bg-white px-2 py-1.5 tabular-nums focus:outline-none"
                    />
                    <input
                      type="number"
                      value={v.stockQty}
                      onChange={(e) =>
                        setVariantRows((rows) =>
                          rows.map((r, i) =>
                            i === idx ? { ...r, stockQty: Number(e.target.value) } : r
                          )
                        )
                      }
                      placeholder="Stock"
                      className="rounded-none bg-white px-2 py-1.5 tabular-nums focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setVariantRows((rows) => rows.filter((_, i) => i !== idx))
                      }
                      className="text-black/60 hover:text-black font-bold text-right cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-5 py-2.5 rounded-none bg-[#F7F7F7] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-2.5 rounded-none bg-black text-white text-xs font-bold uppercase tracking-[0.16em] cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
