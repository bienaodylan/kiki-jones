import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Copy,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Upload,
  FileSpreadsheet,
  X,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { AudienceSlug, Category, ImportJob, Product, ProductStatus, ProductVariant } from '../../types/commerce';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatXOF, getAvailableStock, getColorHex, sanitizeId, slugify } from '../../lib/format';
import {
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  deleteProductAdmin,
  saveProductAndVariants,
} from '../../lib/firestoreService';
import { enrichProductMetadata } from '../../lib/catalogDefaults';
import {
  AUDIENCE_OPTIONS,
  BRAND_OPTIONS,
  classifyProductBilingual,
  COLLECTION_OPTIONS,
  getBrandNameBySlug,
  SUBCATEGORY_OPTIONS,
} from '../../lib/productClassifier';
import { KJ_IMAGES } from '../../lib/navigationData';
import { AdminImportCenter } from './AdminImportCenter';

interface AdminProductsProps {
  products: Product[];
  variants: ProductVariant[];
  categories: Category[];
  importJobs: ImportJob[];
  actorEmail: string;
  initialCreate?: boolean;
  onClearInitialCreate?: () => void;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

interface EditableVariant {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  priceXof: number;
  stockQty: number;
  reservedQty: number;
  lowStockThreshold: number;
  isActive: boolean;
}

const PRESET_GALLERY = Array.from(new Set(Object.values(KJ_IMAGES))).slice(0, 12);

export function AdminProducts({
  products,
  variants,
  categories,
  importJobs,
  actorEmail,
  initialCreate,
  onClearInitialCreate,
  onToast,
}: AdminProductsProps) {
  const { tr } = useLanguage();
  const { user, idToken } = useAuth();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'price_asc' | 'price_desc' | 'stock_asc'>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showImagePresets, setShowImagePresets] = useState(false);
  const [manualClassification, setManualClassification] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: categories[0]?.id || 'cat_women',
    sku: '',
    regularPriceXof: 25000,
    promoPriceXof: '' as string | number,
    lowStockThreshold: 5,
    status: 'published' as ProductStatus,
    isNewDrop: false,
    isFeatured: false,
    isPreorder: false,
    preorderEstimateDate: '',
    seoTitle: '',
    seoDescription: '',
    images: [] as string[],
    audience: 'women' as AudienceSlug,
    subCategory: 'tops',
    brandSlug: 'kiki-luxe',
    collectionSlugs: ['essentials'] as string[],
  });

  const [editVariants, setEditVariants] = useState<EditableVariant[]>([]);

  const computeClassification = (input: {
    name: string;
    description: string;
    categoryId: string;
    isNewDrop: boolean;
    isFeatured: boolean;
  }) => {
    const cat = categories.find((c) => c.id === input.categoryId);
    return classifyProductBilingual({
      name: input.name,
      description: input.description,
      categoryName: cat?.name,
      categoryId: input.categoryId,
      isNewDrop: input.isNewDrop,
      isFeatured: input.isFeatured,
    });
  };

  const openCreateEditor = () => {
    const defaultCat = categories[0];
    const defaultCatId = defaultCat?.id || 'cat_women';
    const baseSku = `KJ-${Date.now().toString().slice(-5)}`;
    const initialDetected = classifyProductBilingual({
      categoryName: defaultCat?.name,
      categoryId: defaultCatId,
      isNewDrop: true,
      isFeatured: false,
    });
    setEditingId(null);
    setManualClassification(false);
    setShowAdvanced(false);
    setShowImagePresets(false);
    setNewImageUrl('');
    setForm({
      name: '',
      slug: '',
      description: '',
      categoryId: defaultCatId,
      sku: baseSku,
      regularPriceXof: 25000,
      promoPriceXof: '',
      lowStockThreshold: 5,
      status: 'published',
      isNewDrop: true,
      isFeatured: false,
      isPreorder: false,
      preorderEstimateDate: '',
      seoTitle: '',
      seoDescription: '',
      images: [KJ_IMAGES.heroCampaign],
      audience: initialDetected.audience,
      subCategory: initialDetected.subCategory,
      brandSlug: initialDetected.brandSlug,
      collectionSlugs: initialDetected.collectionSlugs,
    });
    setEditVariants([
      {
        id: sanitizeId(`var_${baseSku}_NOIR_S`),
        sku: `${baseSku}-NOI-S`,
        color: 'Noir',
        colorHex: '#111111',
        size: 'S',
        priceXof: 25000,
        stockQty: 10,
        reservedQty: 0,
        lowStockThreshold: 5,
        isActive: true,
      },
      {
        id: sanitizeId(`var_${baseSku}_NOIR_M`),
        sku: `${baseSku}-NOI-M`,
        color: 'Noir',
        colorHex: '#111111',
        size: 'M',
        priceXof: 25000,
        stockQty: 10,
        reservedQty: 0,
        lowStockThreshold: 5,
        isActive: true,
      },
      {
        id: sanitizeId(`var_${baseSku}_NOIR_L`),
        sku: `${baseSku}-NOI-L`,
        color: 'Noir',
        colorHex: '#111111',
        size: 'L',
        priceXof: 25000,
        stockQty: 10,
        reservedQty: 0,
        lowStockThreshold: 5,
        isActive: true,
      },
    ]);
    setEditorOpen(true);
  };

  useEffect(() => {
    if (initialCreate) {
      openCreateEditor();
      onClearInitialCreate?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCreate]);

  const openEditEditor = (product: Product) => {
    const pVars = variants.filter((v) => v.productId === product.id);
    const enriched = enrichProductMetadata(product);
    setEditingId(product.id);
    setManualClassification(true);
    setShowAdvanced(false);
    setShowImagePresets(false);
    setNewImageUrl('');
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      sku: product.sku,
      regularPriceXof: product.regularPriceXof,
      promoPriceXof: product.promoPriceXof ?? '',
      lowStockThreshold: product.lowStockThreshold ?? 5,
      status: product.status,
      isNewDrop: Boolean(product.isNewDrop),
      isFeatured: Boolean(product.isFeatured),
      isPreorder: Boolean(product.isPreorder),
      preorderEstimateDate: product.preorderEstimateDate || '',
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      images: product.images || [],
      audience: enriched.audience || 'women',
      subCategory: enriched.subCategory || 'tops',
      brandSlug: enriched.brandSlug || 'kiki-luxe',
      collectionSlugs:
        Array.isArray(enriched.collectionSlugs) && enriched.collectionSlugs.length > 0
          ? enriched.collectionSlugs
          : ['essentials'],
    });
    setEditVariants(
      pVars.length > 0
        ? pVars.map((v) => ({
            id: v.id,
            sku: v.sku,
            color: v.color,
            colorHex: v.colorHex,
            size: v.size,
            priceXof: v.priceXof,
            stockQty: v.stockQty,
            reservedQty: v.reservedQty || 0,
            lowStockThreshold: v.lowStockThreshold ?? 5,
            isActive: v.isActive,
          }))
        : [
            {
              id: sanitizeId(`var_${product.sku}_STD_OS`),
              sku: `${product.sku}-OS`,
              color: product.colors?.[0] || 'Noir',
              colorHex: getColorHex(product.colors?.[0] || 'Noir'),
              size: product.sizes?.[0] || 'M',
              priceXof: product.promoPriceXof ?? product.regularPriceXof,
              stockQty: 5,
              reservedQty: 0,
              lowStockThreshold: 5,
              isActive: true,
            },
          ]
    );
    setEditorOpen(true);
  };

  const productStockMap = useMemo(() => {
    const map = new Map<string, number>();
    variants.forEach((v) => {
      if (!v.isActive) return;
      map.set(v.productId, (map.get(v.productId) || 0) + getAvailableStock(v));
    });
    return map;
  }, [variants]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price_asc') return (a.promoPriceXof ?? a.regularPriceXof) - (b.promoPriceXof ?? b.regularPriceXof);
      if (sortBy === 'price_desc') return (b.promoPriceXof ?? b.regularPriceXof) - (a.promoPriceXof ?? a.regularPriceXof);
      if (sortBy === 'stock_asc') return (productStockMap.get(a.id) || 0) - (productStockMap.get(b.id) || 0);
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
  }, [products, categoryFilter, statusFilter, search, sortBy, productStockMap]);

  const allSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (status: ProductStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateProductStatus(selectedIds, status, actorEmail);
      onToast(
        tr(`${selectedIds.length} produit(s) mis à jour.`, `${selectedIds.length} product(s) updated.`),
        'success'
      );
      setSelectedIds([]);
    } catch (err: any) {
      onToast(err?.message || tr('Erreur lors de la mise à jour.', 'Bulk update failed.'), 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteProducts(selectedIds, actorEmail);
      onToast(
        tr(`${selectedIds.length} produit(s) supprimé(s).`, `${selectedIds.length} product(s) deleted.`),
        'success'
      );
      setSelectedIds([]);
    } catch (err: any) {
      onToast(err?.message || tr('Suppression impossible.', 'Delete failed.'), 'error');
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const suffix = Date.now().toString().slice(-4);
      const newSku = `${product.sku}-COPY-${suffix}`.slice(0, 60);
      const pVars = variants.filter((v) => v.productId === product.id);
      const copyVars = pVars.map((v, idx) => ({
        id: sanitizeId(`var_${newSku}_${idx}`),
        productId: '',
        sku: `${newSku}-${v.size}-${idx}`.slice(0, 75),
        color: v.color,
        colorHex: v.colorHex,
        size: v.size,
        priceXof: v.priceXof,
        compareAtPriceXof: v.compareAtPriceXof ?? null,
        stockQty: v.stockQty,
        reservedQty: 0,
        lowStockThreshold: v.lowStockThreshold ?? 5,
        weightGrams: v.weightGrams ?? 250,
        isActive: v.isActive,
      }));
      const enriched = enrichProductMetadata(product);
      await saveProductAndVariants(
        null,
        {
          name: `${product.name} (${tr('Copie', 'Copy')})`,
          slug: `${product.slug}-copy-${suffix}`,
          description: product.description,
          categoryId: product.categoryId,
          categoryName: product.categoryName,
          sku: newSku,
          externalShopifyHandle: `${product.slug}-copy-${suffix}`,
          images: product.images,
          runwayModelImageUrl: product.runwayModelImageUrl ?? null,
          colors: product.colors,
          sizes: product.sizes,
          regularPriceXof: product.regularPriceXof,
          promoPriceXof: product.promoPriceXof ?? null,
          lowStockThreshold: product.lowStockThreshold ?? 5,
          status: 'draft',
          isNewDrop: false,
          newDropOrder: 99,
          isFeatured: false,
          featuredOrder: 99,
          isPreorder: product.isPreorder,
          preorderLimit: product.preorderLimit ?? null,
          preorderEstimateDate: product.preorderEstimateDate ?? null,
          seoTitle: product.seoTitle ?? null,
          seoDescription: product.seoDescription ?? null,
          audience: enriched.audience || 'women',
          subCategory: enriched.subCategory || 'tops',
          brandSlug: enriched.brandSlug || 'kiki-luxe',
          brandName: enriched.brandName || getBrandNameBySlug(enriched.brandSlug),
          collectionSlugs: enriched.collectionSlugs || ['essentials'],
        },
        copyVars,
        actorEmail
      );
      onToast(tr('Produit dupliqué en brouillon.', 'Product duplicated as draft.'), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Duplication impossible.', 'Failed to duplicate.'), 'error');
    }
  };

  const handleDeleteSingle = async (product: Product) => {
    try {
      await deleteProductAdmin(product.id, actorEmail);
      onToast(tr(`"${product.name}" supprimé.`, `"${product.name}" deleted.`), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Suppression impossible.', 'Delete failed.'), 'error');
    }
  };

  const handleUploadImageFile = async (file: File) => {
    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Read error'));
        reader.readAsDataURL(file);
      });
      const token = user ? await user.getIdToken() : idToken;
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload error');
      setForm((prev) => ({ ...prev, images: [...prev.images, data.url].slice(0, 12) }));
      onToast(tr('Image importée.', 'Image uploaded.'), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Échec de l’import d’image.', 'Image upload failed.'), 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      onToast(tr('Le nom du produit est requis.', 'Product name is required.'), 'error');
      return;
    }
    setSaving(true);
    try {
      const cat = categories.find((c) => c.id === form.categoryId) || categories[0];
      const regularPrice = Math.max(0, Math.round(Number(form.regularPriceXof) || 0));
      const promoNum =
        form.promoPriceXof !== '' && Number(form.promoPriceXof) > 0
          ? Math.round(Number(form.promoPriceXof))
          : null;
      const cleanSlug = slugify(form.slug || form.name) || `product-${Date.now()}`;
      const cleanSku = (form.sku.trim() || `KJ-${Date.now().toString().slice(-5)}`).slice(0, 60);

      const finalVars = editVariants.map((v, idx) => ({
        id: v.id || sanitizeId(`var_${cleanSku}_${idx}`),
        productId: editingId || '',
        sku: (v.sku.trim() || `${cleanSku}-${idx + 1}`).slice(0, 75),
        color: v.color.trim() || 'Noir',
        colorHex: v.colorHex || getColorHex(v.color),
        size: v.size.trim() || 'M',
        priceXof: Math.max(0, Math.round(Number(v.priceXof) || promoNum || regularPrice)),
        compareAtPriceXof: promoNum ? regularPrice : null,
        stockQty: Math.max(0, Math.round(Number(v.stockQty) || 0)),
        reservedQty: v.reservedQty || 0,
        lowStockThreshold: Math.max(0, Math.round(Number(form.lowStockThreshold) || 5)),
        weightGrams: 250,
        isActive: v.isActive,
      }));

      const colors = Array.from(new Set(finalVars.map((v) => v.color))).slice(0, 12);
      const sizes = Array.from(new Set(finalVars.map((v) => v.size))).slice(0, 12);

      await saveProductAndVariants(
        editingId,
        {
          name: form.name.trim().slice(0, 155),
          slug: cleanSlug,
          description: (form.description.trim() || form.name.trim()).slice(0, 3900),
          categoryId: cat?.id || 'cat_women',
          categoryName: cat?.name || 'Femme',
          sku: cleanSku,
          externalShopifyHandle: cleanSlug,
          images: form.images.length > 0 ? form.images : [KJ_IMAGES.heroCampaign],
          runwayModelImageUrl: form.images[1] || form.images[0] || null,
          colors,
          sizes,
          regularPriceXof: regularPrice,
          promoPriceXof: promoNum,
          lowStockThreshold: Math.max(0, Math.round(Number(form.lowStockThreshold) || 5)),
          status: form.status,
          isNewDrop: form.isNewDrop,
          newDropOrder: 10,
          isFeatured: form.isFeatured,
          featuredOrder: 10,
          isPreorder: form.isPreorder,
          preorderLimit: null,
          preorderEstimateDate: form.isPreorder && form.preorderEstimateDate ? form.preorderEstimateDate : null,
          seoTitle: form.seoTitle.trim() || `${form.name.trim()} — KIKI JONES`,
          seoDescription: (form.seoDescription.trim() || form.description.trim()).slice(0, 300),
          audience: form.audience,
          subCategory: form.subCategory,
          brandSlug: form.brandSlug,
          brandName: getBrandNameBySlug(form.brandSlug),
          collectionSlugs: form.collectionSlugs.slice(0, 10),
        },
        finalVars,
        actorEmail
      );

      onToast(
        editingId
          ? tr('Produit mis à jour.', 'Product updated.')
          : tr('Produit créé avec succès.', 'Product created.'),
        'success'
      );
      setEditorOpen(false);
    } catch (err: any) {
      onToast(err?.message || tr('Erreur lors de l’enregistrement.', 'Failed to save product.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = (s: ProductStatus) => {
    if (s === 'published') return tr('Publié', 'Published');
    if (s === 'draft') return tr('Brouillon', 'Draft');
    return tr('Archivé', 'Archived');
  };

  // Focused Product Editor View
  if (editorOpen) {
    return (
      <form onSubmit={handleSaveEditor} className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="p-2 border border-[#E8E8E8] bg-white hover:border-black cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-black">
                {editingId ? tr('Modifier le produit', 'Edit product') : tr('Nouveau produit', 'Add product')}
              </h1>
              <p className="text-[11px] text-black/50">
                {tr('Champs essentiels affichés en priorité.', 'Essential fields shown upfront.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="px-4 py-2 border border-[#E8E8E8] bg-white hover:border-black text-xs cursor-pointer"
            >
              {tr('Annuler', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer"
            >
              {saving ? tr('Enregistrement...', 'Saving...') : tr('Enregistrer', 'Save')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Description */}
            <div className="bg-white border border-[#E8E8E8] p-5 space-y-4 text-xs">
              <label className="block space-y-1.5">
                <span className="font-medium text-black">{tr('Titre du produit', 'Title')}</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setForm((prev) => {
                      if (manualClassification) return { ...prev, name: nextName };
                      const detected = computeClassification({
                        name: nextName,
                        description: prev.description,
                        categoryId: prev.categoryId,
                        isNewDrop: prev.isNewDrop,
                        isFeatured: prev.isFeatured,
                      });
                      return {
                        ...prev,
                        name: nextName,
                        audience: detected.audience,
                        subCategory: detected.subCategory,
                        brandSlug: detected.brandSlug,
                        collectionSlugs: detected.collectionSlugs,
                      };
                    });
                  }}
                  placeholder={tr('Ex : Robe Midi Drapée Noir', 'e.g. Draped Midi Dress Black')}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="font-medium text-black">{tr('Description', 'Description')}</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => {
                    const nextDesc = e.target.value;
                    setForm((prev) => {
                      if (manualClassification) return { ...prev, description: nextDesc };
                      const detected = computeClassification({
                        name: prev.name,
                        description: nextDesc,
                        categoryId: prev.categoryId,
                        isNewDrop: prev.isNewDrop,
                        isFeatured: prev.isFeatured,
                      });
                      return {
                        ...prev,
                        description: nextDesc,
                        audience: detected.audience,
                        subCategory: detected.subCategory,
                        brandSlug: detected.brandSlug,
                        collectionSlugs: detected.collectionSlugs,
                      };
                    });
                  }}
                  placeholder={tr('Coupe, matière et détails essentiels...', 'Fit, fabric, and key styling details...')}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none resize-none"
                />
              </label>
            </div>

            {/* Media */}
            <div className="bg-white border border-[#E8E8E8] p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-black">{tr('Images', 'Media')}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImagePresets((v) => !v)}
                    className="text-[11px] text-black/60 hover:text-black underline cursor-pointer"
                  >
                    {tr('Bibliothèque', 'Library')}
                  </button>
                  <label className="px-3 py-1.5 border border-[#E8E8E8] hover:border-black inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? tr('Import...', 'Uploading...') : tr('Importer', 'Upload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadImageFile(f);
                      }}
                    />
                  </label>
                </div>
              </div>

              {form.images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                  {form.images.map((img, idx) => (
                    <div key={`${img}_${idx}`} className="relative group aspect-[3/4] bg-[#F5F5F5] border border-[#E8E8E8]">
                      <img src={img} alt="" className="w-full h-full object-cover object-top" />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 p-1 bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder={tr('Ajouter une URL d’image (/assets/...)', 'Add image URL (/assets/...)')}
                  className="flex-1 border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newImageUrl.trim()) return;
                    setForm((prev) => ({
                      ...prev,
                      images: [...prev.images, newImageUrl.trim()].slice(0, 12),
                    }));
                    setNewImageUrl('');
                  }}
                  className="px-4 py-2 border border-[#E8E8E8] hover:border-black font-medium cursor-pointer"
                >
                  {tr('Ajouter', 'Add')}
                </button>
              </div>

              {showImagePresets && (
                <div className="grid grid-cols-6 gap-2 pt-2 border-t border-[#F0F0F0]">
                  {PRESET_GALLERY.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.includes(url) ? prev.images : [...prev.images, url].slice(0, 12),
                        }))
                      }
                      className="aspect-[3/4] border border-[#E8E8E8] hover:border-black overflow-hidden cursor-pointer"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Variants & Inventory */}
            <div className="bg-white border border-[#E8E8E8] p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-black">{tr('Variantes & Stock', 'Variants & Stock')}</span>
                  <p className="text-[11px] text-black/50 mt-0.5">
                    {tr('Couleurs, tailles, prix et quantités disponibles.', 'Colors, sizes, pricing, and stock quantities.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditVariants((prev) => [
                      ...prev,
                      {
                        id: sanitizeId(`var_${form.sku || 'KJ'}_${Date.now()}_${prev.length}`),
                        sku: `${form.sku || 'KJ'}-${prev.length + 1}`,
                        color: prev[prev.length - 1]?.color || 'Noir',
                        colorHex: prev[prev.length - 1]?.colorHex || '#111111',
                        size: 'XL',
                        priceXof: Number(form.promoPriceXof) || Number(form.regularPriceXof) || 25000,
                        stockQty: 5,
                        reservedQty: 0,
                        lowStockThreshold: form.lowStockThreshold,
                        isActive: true,
                      },
                    ])
                  }
                  className="px-3 py-1.5 border border-[#E8E8E8] hover:border-black font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tr('Variante', 'Variant')}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[11px] text-black/45 border-b border-[#E8E8E8]">
                      <th className="py-2 pr-2">{tr('Couleur', 'Color')}</th>
                      <th className="py-2 pr-2">{tr('Taille', 'Size')}</th>
                      <th className="py-2 pr-2">SKU</th>
                      <th className="py-2 pr-2">{tr('Prix (XOF)', 'Price (XOF)')}</th>
                      <th className="py-2 pr-2">{tr('Stock', 'Stock')}</th>
                      <th className="py-2 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {editVariants.map((v, idx) => (
                      <tr key={v.id}>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) => {
                              const next = [...editVariants];
                              next[idx] = { ...v, color: e.target.value, colorHex: getColorHex(e.target.value) };
                              setEditVariants(next);
                            }}
                            className="w-24 border border-[#E8E8E8] focus:border-black px-2 py-1 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={v.size}
                            onChange={(e) => {
                              const next = [...editVariants];
                              next[idx] = { ...v, size: e.target.value };
                              setEditVariants(next);
                            }}
                            className="w-16 border border-[#E8E8E8] focus:border-black px-2 py-1 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => {
                              const next = [...editVariants];
                              next[idx] = { ...v, sku: e.target.value };
                              setEditVariants(next);
                            }}
                            className="w-32 border border-[#E8E8E8] focus:border-black px-2 py-1 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            value={v.priceXof}
                            onChange={(e) => {
                              const next = [...editVariants];
                              next[idx] = { ...v, priceXof: Number(e.target.value) };
                              setEditVariants(next);
                            }}
                            className="w-24 border border-[#E8E8E8] focus:border-black px-2 py-1 tabular-nums focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            value={v.stockQty}
                            onChange={(e) => {
                              const next = [...editVariants];
                              next[idx] = { ...v, stockQty: Number(e.target.value) };
                              setEditVariants(next);
                            }}
                            className="w-16 border border-[#E8E8E8] focus:border-black px-2 py-1 tabular-nums focus:outline-none"
                          />
                        </td>
                        <td className="py-2 text-right">
                          {editVariants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setEditVariants((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-black/40 hover:text-black cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Collapsible Advanced Options */}
            <div className="bg-white border border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-medium text-black cursor-pointer"
              >
                <span>{tr('Options avancées (SEO, SKU, Précommande)', 'Advanced options (SEO, SKU, Pre-order)')}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showAdvanced && (
                <div className="px-5 pb-5 pt-2 border-t border-[#F0F0F0] space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block space-y-1">
                      <span className="text-black/60">SKU principal</span>
                      <input
                        type="text"
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-black/60">{tr('Seuil de stock faible', 'Low stock threshold')}</span>
                      <input
                        type="number"
                        min={0}
                        value={form.lowStockThreshold}
                        onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                        className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-black/60">{tr('Titre SEO', 'SEO title')}</span>
                    <input
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-black/60">{tr('Meta description SEO', 'SEO description')}</span>
                    <textarea
                      rows={2}
                      value={form.seoDescription}
                      onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                      className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none resize-none"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isPreorder}
                        onChange={(e) => setForm({ ...form, isPreorder: e.target.checked })}
                        className="accent-black"
                      />
                      <span>{tr('Activer la précommande', 'Enable pre-order')}</span>
                    </label>
                    {form.isPreorder && (
                      <input
                        type="text"
                        value={form.preorderEstimateDate}
                        onChange={(e) => setForm({ ...form, preorderEstimateDate: e.target.value })}
                        placeholder={tr('Expédition estimée (ex : 15 juin)', 'Est. ship date (e.g. June 15)')}
                        className="border border-[#E8E8E8] focus:border-black px-3 py-1.5 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Status, Pricing, Organization */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E8E8E8] p-5 space-y-4 text-xs">
              <label className="block space-y-1.5">
                <span className="font-medium text-black">{tr('Statut', 'Status')}</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="published">{tr('Publié', 'Published')}</option>
                  <option value="draft">{tr('Brouillon', 'Draft')}</option>
                  <option value="archived">{tr('Archivé', 'Archived')}</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="font-medium text-black">{tr('Collection / Catégorie', 'Collection / Category')}</span>
                <select
                  value={form.categoryId}
                  onChange={(e) => {
                    const nextCatId = e.target.value;
                    setForm((prev) => {
                      if (manualClassification) return { ...prev, categoryId: nextCatId };
                      const detected = computeClassification({
                        name: prev.name,
                        description: prev.description,
                        categoryId: nextCatId,
                        isNewDrop: prev.isNewDrop,
                        isFeatured: prev.isFeatured,
                      });
                      return {
                        ...prev,
                        categoryId: nextCatId,
                        audience: detected.audience,
                        subCategory: detected.subCategory,
                        brandSlug: detected.brandSlug,
                        collectionSlugs: detected.collectionSlugs,
                      };
                    });
                  }}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 bg-white focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Mega-Menu & Storefront Routing Control */}
            <div className="bg-white border border-[#E8E8E8] p-5 space-y-4 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium text-black block">
                    {tr('Classement Méga-Menu', 'Mega-Menu Placement')}
                  </span>
                  <span className="text-[11px] text-black/45 block mt-0.5">
                    {manualClassification
                      ? tr('Mode manuel (contrôle direct)', 'Manual override active')
                      : tr('Détection auto FR/EN active', 'Bilingual FR/EN auto-detect')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const detected = computeClassification({
                      name: form.name,
                      description: form.description,
                      categoryId: form.categoryId,
                      isNewDrop: form.isNewDrop,
                      isFeatured: form.isFeatured,
                    });
                    setForm((prev) => ({
                      ...prev,
                      audience: detected.audience,
                      subCategory: detected.subCategory,
                      brandSlug: detected.brandSlug,
                      collectionSlugs: detected.collectionSlugs,
                    }));
                    setManualClassification(false);
                    onToast(
                      tr(
                        'Classement détecté automatiquement (FR/EN).',
                        'Mega-menu placement auto-detected (FR/EN).'
                      ),
                      'default'
                    );
                  }}
                  className="px-2.5 py-1.5 border border-[#E8E8E8] hover:border-black bg-[#FAFAFA] text-[11px] font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{tr('Auto-détecter', 'Auto-detect')}</span>
                </button>
              </div>

              <label className="block space-y-1">
                <span className="text-black/60">{tr('Rayon (Audience)', 'Department (Audience)')}</span>
                <select
                  value={form.audience}
                  onChange={(e) => {
                    setManualClassification(true);
                    setForm({ ...form, audience: e.target.value as AudienceSlug });
                  }}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 bg-white focus:outline-none"
                >
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {tr(opt.labelFr, opt.labelEn)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-black/60">{tr('Sous-catégorie (Méga-Menu)', 'Sub-category (Mega-Menu)')}</span>
                <select
                  value={form.subCategory}
                  onChange={(e) => {
                    setManualClassification(true);
                    setForm({ ...form, subCategory: e.target.value });
                  }}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 bg-white focus:outline-none"
                >
                  {SUBCATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {tr(opt.labelFr, opt.labelEn)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-black/60">{tr('Marque KIKI JONES', 'KIKI JONES Brand Line')}</span>
                <select
                  value={form.brandSlug}
                  onChange={(e) => {
                    setManualClassification(true);
                    setForm({ ...form, brandSlug: e.target.value });
                  }}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 bg-white focus:outline-none"
                >
                  {BRAND_OPTIONS.map((opt) => (
                    <option key={opt.slug} value={opt.slug}>
                      {tr(opt.labelFr, opt.labelEn)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-1.5 pt-1 border-t border-[#F0F0F0]">
                <span className="text-black/60 block">
                  {tr('Collections éditoriales', 'Editorial Collections')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COLLECTION_OPTIONS.map((col) => {
                    const active = form.collectionSlugs.includes(col.value);
                    return (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => {
                          setManualClassification(true);
                          setForm((prev) => {
                            const exists = prev.collectionSlugs.includes(col.value);
                            const next = exists
                              ? prev.collectionSlugs.filter((s) => s !== col.value)
                              : [...prev.collectionSlugs, col.value];
                            return { ...prev, collectionSlugs: next };
                          });
                        }}
                        className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                          active
                            ? 'bg-black text-white border-black font-medium'
                            : 'bg-white text-black/65 border-[#E8E8E8] hover:border-black'
                        }`}
                      >
                        {tr(col.labelFr, col.labelEn)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8E8E8] p-5 space-y-4 text-xs">
              <span className="font-medium text-black block">{tr('Tarification (XOF)', 'Pricing (XOF)')}</span>
              <label className="block space-y-1">
                <span className="text-black/60">{tr('Prix régulier', 'Regular price')}</span>
                <input
                  type="number"
                  min={0}
                  required
                  value={form.regularPriceXof}
                  onChange={(e) => setForm({ ...form, regularPriceXof: Number(e.target.value) })}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-black/60">{tr('Prix promotionnel (optionnel)', 'Sale price (optional)')}</span>
                <input
                  type="number"
                  min={0}
                  value={form.promoPriceXof}
                  onChange={(e) =>
                    setForm({ ...form, promoPriceXof: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="—"
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
                />
              </label>
            </div>

            <div className="bg-white border border-[#E8E8E8] p-5 space-y-3 text-xs">
              <span className="font-medium text-black block">{tr('Mise en avant', 'Merchandising')}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNewDrop}
                  onChange={(e) => setForm({ ...form, isNewDrop: e.target.checked })}
                  className="accent-black"
                />
                <span>{tr('Afficher dans Nouveautés', 'Show in New Arrivals')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="accent-black"
                />
                <span>{tr('Produit à la une', 'Featured product')}</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-black">
            {tr('Produits', 'Products')}
          </h1>
          <p className="text-xs text-black/55 mt-0.5 tabular-nums">
            {products.length} {tr('produits au catalogue', 'catalog products')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="px-3.5 py-2 border border-[#E8E8E8] bg-white hover:border-black text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{tr('Importer CSV', 'Import CSV')}</span>
          </button>
          <button
            type="button"
            onClick={openCreateEditor}
            className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{tr('Ajouter un produit', 'Add product')}</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-black text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-medium tabular-nums">
            {selectedIds.length} {tr('sélectionné(s)', 'selected')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatus('published')}
              className="px-3 py-1 bg-white text-black font-medium cursor-pointer"
            >
              {tr('Publier', 'Publish')}
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus('draft')}
              className="px-3 py-1 border border-white/30 hover:border-white cursor-pointer"
            >
              {tr('Brouillon', 'Draft')}
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1 border border-white/30 hover:border-white cursor-pointer"
            >
              {tr('Supprimer', 'Delete')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Search, Filter & Table */}
      <div className="bg-white border border-[#E8E8E8]">
        <div className="p-3.5 flex flex-col md:flex-row gap-3 border-b border-[#E8E8E8]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr('Rechercher un produit ou SKU...', 'Search product or SKU...')}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E8E8] focus:border-black focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-[#E8E8E8] focus:border-black bg-white focus:outline-none"
          >
            <option value="all">{tr('Toutes les collections', 'All collections')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-[#E8E8E8] focus:border-black bg-white focus:outline-none"
          >
            <option value="all">{tr('Tous les statuts', 'All statuses')}</option>
            <option value="published">{tr('Publié', 'Published')}</option>
            <option value="draft">{tr('Brouillon', 'Draft')}</option>
            <option value="archived">{tr('Archivé', 'Archived')}</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs border border-[#E8E8E8] focus:border-black bg-white focus:outline-none"
          >
            <option value="newest">{tr('Plus récents', 'Newest')}</option>
            <option value="name">{tr('Nom (A–Z)', 'Name (A–Z)')}</option>
            <option value="price_asc">{tr('Prix croissant', 'Price: Low to high')}</option>
            <option value="price_desc">{tr('Prix décroissant', 'Price: High to low')}</option>
            <option value="stock_asc">{tr('Stock croissant', 'Stock: Low to high')}</option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-xs text-black/50">
            {tr('Aucun produit trouvé.', 'No products found.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-medium text-black/45 border-b border-[#E8E8E8]">
                  <th className="py-3 pl-4 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="accent-black cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2">{tr('Produit', 'Product')}</th>
                  <th className="py-3 px-3">{tr('Catégorie', 'Category')}</th>
                  <th className="py-3 px-3">{tr('Prix', 'Price')}</th>
                  <th className="py-3 px-3">{tr('Stock', 'Stock')}</th>
                  <th className="py-3 px-3">{tr('Statut', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{tr('Actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filteredProducts.map((p) => {
                  const totalStock = productStockMap.get(p.id) || 0;
                  const checked = selectedIds.includes(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelectOne(p.id)}
                          className="accent-black cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-10 h-12 object-cover object-top bg-[#F5F5F5] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-12 bg-[#F5F5F5] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => openEditEditor(p)}
                              className="font-medium text-black hover:underline text-left truncate max-w-[240px] block cursor-pointer"
                            >
                              {p.name}
                            </button>
                            <p className="text-[11px] text-black/45">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-black/70">{p.categoryName}</td>
                      <td className="py-3 px-3 tabular-nums whitespace-nowrap">
                        {p.promoPriceXof ? (
                          <div>
                            <span className="font-semibold text-black">{formatXOF(p.promoPriceXof)}</span>
                            <span className="block text-[10.5px] text-black/40 line-through">
                              {formatXOF(p.regularPriceXof)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-black">{formatXOF(p.regularPriceXof)}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 tabular-nums">
                        <span
                          className={
                            totalStock === 0
                              ? 'text-black font-semibold'
                              : totalStock <= (p.lowStockThreshold ?? 5)
                                ? 'text-black/80 font-medium'
                                : 'text-black/60'
                          }
                        >
                          {totalStock === 0
                            ? tr('Épuisé', 'Out of stock')
                            : `${totalStock} ${tr('en stock', 'in stock')}`}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10.5px] border ${
                            p.status === 'published'
                              ? 'bg-black text-white border-black'
                              : 'bg-[#F5F5F5] text-black/70 border-[#E8E8E8]'
                          }`}
                        >
                          {statusLabel(p.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditEditor(p)}
                            title={tr('Modifier', 'Edit')}
                            className="p-1.5 text-black/60 hover:text-black cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p)}
                            title={tr('Dupliquer', 'Duplicate')}
                            className="p-1.5 text-black/60 hover:text-black cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(p)}
                            title={tr('Supprimer', 'Delete')}
                            className="p-1.5 text-black/45 hover:text-black cursor-pointer"
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
        )}
      </div>

      {/* CSV Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setImportOpen(false)} />
          <div className="relative bg-white border border-[#E8E8E8] w-full max-w-5xl max-h-[90vh] overflow-y-auto z-10 p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8E8E8]">
              <h2 className="text-base font-semibold text-black">
                {tr('Import CSV de produits', 'CSV Product Import')}
              </h2>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="p-1.5 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AdminImportCenter
              products={products}
              variants={variants}
              categories={categories}
              importJobs={importJobs}
              actorEmail={actorEmail}
              onToast={onToast}
            />
          </div>
        </div>
      )}
    </div>
  );
}
