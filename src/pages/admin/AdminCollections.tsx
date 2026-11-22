import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, X, Search, Upload } from 'lucide-react';
import { Category, Product } from '../../types/commerce';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  assignProductsToCategory,
  deleteCategoryAdmin,
  saveCategory,
} from '../../lib/firestoreService';
import { slugify } from '../../lib/format';
import { KJ_IMAGES } from '../../lib/navigationData';

interface AdminCollectionsProps {
  categories: Category[];
  products: Product[];
  actorEmail: string;
  initialCreate?: boolean;
  onClearInitialCreate?: () => void;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

const COVER_PRESETS = Array.from(new Set(Object.values(KJ_IMAGES))).slice(0, 10);

export function AdminCollections({
  categories,
  products,
  actorEmail,
  initialCreate,
  onClearInitialCreate,
  onToast,
}: AdminCollectionsProps) {
  const { tr } = useLanguage();
  const { user, idToken } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: KJ_IMAGES.heroCampaign,
    sortOrder: 1,
    isActive: true,
  });
  const [assignedProductIds, setAssignedProductIds] = useState<string[]>([]);

  const productCountMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.categoryId, (map.get(p.categoryId) || 0) + 1);
    });
    return map;
  }, [products]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      imageUrl: KJ_IMAGES.heroCampaign,
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setAssignedProductIds([]);
    setProductSearch('');
    setDrawerOpen(true);
  };

  useEffect(() => {
    if (initialCreate) {
      openCreate();
      onClearInitialCreate?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCreate]);

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl || KJ_IMAGES.heroCampaign,
      sortOrder: cat.sortOrder ?? 1,
      isActive: cat.isActive,
    });
    setAssignedProductIds(products.filter((p) => p.categoryId === cat.id).map((p) => p.id));
    setProductSearch('');
    setDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const catId = await saveCategory(
        editingId,
        {
          name: form.name.trim().slice(0, 80),
          slug: slugify(form.slug || form.name),
          description: form.description.trim().slice(0, 480),
          imageUrl: (form.imageUrl.trim() || KJ_IMAGES.heroCampaign).slice(0, 480),
          sortOrder: Math.max(0, Math.round(Number(form.sortOrder) || 0)),
          isActive: form.isActive,
        },
        actorEmail
      );

      if (catId && assignedProductIds.length > 0) {
        const toUpdate = assignedProductIds.filter((pid) => {
          const prod = products.find((p) => p.id === pid);
          return prod && prod.categoryId !== catId;
        });
        if (toUpdate.length > 0) {
          await assignProductsToCategory(toUpdate, catId, form.name.trim(), actorEmail);
        }
      }

      onToast(
        editingId
          ? tr('Collection mise à jour.', 'Collection updated.')
          : tr('Collection créée.', 'Collection created.'),
        'success'
      );
      setDrawerOpen(false);
    } catch (err: any) {
      onToast(err?.message || tr('Erreur lors de l’enregistrement.', 'Failed to save collection.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await saveCategory(
        cat.id,
        {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          imageUrl: cat.imageUrl,
          sortOrder: Math.max(0, Math.round(cat.sortOrder || 0)),
          isActive: !cat.isActive,
        },
        actorEmail
      );
      onToast(
        !cat.isActive
          ? tr(`"${cat.name}" publiée.`, `"${cat.name}" published.`)
          : tr(`"${cat.name}" masquée.`, `"${cat.name}" hidden.`),
        'success'
      );
    } catch (err: any) {
      onToast(err?.message || tr('Échec de la mise à jour.', 'Update failed.'), 'error');
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      await deleteCategoryAdmin(cat.id, actorEmail);
      onToast(tr(`Collection "${cat.name}" supprimée.`, `Collection "${cat.name}" deleted.`), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Suppression impossible.', 'Delete failed.'), 'error');
    }
  };

  const handleUploadCover = async (file: File) => {
    setUploadingCover(true);
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
      setForm((prev) => ({ ...prev, imageUrl: String(data.url) }));
      onToast(tr('Image importée.', 'Cover image uploaded.'), 'success');
    } catch (err: any) {
      onToast(err?.message || tr('Échec de l’import d’image.', 'Image upload failed.'), 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const filteredAssignableProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 30);
    const q = productSearch.trim().toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 30);
  }, [products, productSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-black">
            {tr('Collections', 'Collections')}
          </h1>
          <p className="text-xs text-black/55 mt-0.5 tabular-nums">
            {categories.length} {tr('collections configurées', 'configured collections')}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{tr('Créer une collection', 'Create collection')}</span>
        </button>
      </div>

      {/* Collections Table */}
      <div className="bg-white border border-[#E8E8E8]">
        {categories.length === 0 ? (
          <div className="p-10 text-center text-xs text-black/50">
            {tr('Aucune collection pour le moment.', 'No collections created yet.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-medium text-black/45 border-b border-[#E8E8E8]">
                  <th className="py-3 px-4">{tr('Collection', 'Collection')}</th>
                  <th className="py-3 px-3">{tr('Produits', 'Products')}</th>
                  <th className="py-3 px-3">{tr('Ordre', 'Order')}</th>
                  <th className="py-3 px-3">{tr('Statut', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{tr('Actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {[...categories]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="w-11 h-11 object-cover object-top bg-[#F5F5F5] shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 bg-[#F5F5F5] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => openEdit(cat)}
                              className="font-medium text-black hover:underline text-left cursor-pointer"
                            >
                              {cat.name}
                            </button>
                            <p className="text-[11px] text-black/45 truncate max-w-xs">
                              {cat.description || `/${cat.slug}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 tabular-nums text-black/75">
                        {productCountMap.get(cat.id) || 0}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-black/55">{cat.sortOrder}</td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          className={`px-2 py-0.5 text-[10.5px] border cursor-pointer ${
                            cat.isActive
                              ? 'bg-black text-white border-black'
                              : 'bg-[#F5F5F5] text-black/65 border-[#E8E8E8]'
                          }`}
                        >
                          {cat.isActive ? tr('Publiée', 'Published') : tr('Masquée', 'Hidden')}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(cat)}
                            className="p-1.5 text-black/60 hover:text-black cursor-pointer"
                            title={tr('Modifier', 'Edit')}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="p-1.5 text-black/45 hover:text-black cursor-pointer"
                            title={tr('Supprimer', 'Delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collection Editor Slide-Over */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/35" onClick={() => setDrawerOpen(false)} />
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-lg bg-white h-full border-l border-[#E8E8E8] flex flex-col z-10"
          >
            <div className="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-black">
                {editingId
                  ? tr('Modifier la collection', 'Edit collection')
                  : tr('Nouvelle collection', 'New collection')}
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <label className="block space-y-1.5">
                <span className="font-medium text-black">{tr('Nom de la collection', 'Collection title')}</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={tr('Ex : Essentiels Soirée', 'e.g. Evening Essentials')}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="font-medium text-black">{tr('Description', 'Description')}</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none resize-none"
                />
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-black">{tr('Image de couverture', 'Cover image')}</span>
                  <label className="px-2.5 py-1 border border-black bg-black text-white text-[11px] font-medium inline-flex items-center gap-1 hover:bg-black/85 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingCover ? tr('Import...', 'Uploading...') : tr('Importer', 'Upload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadCover(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
                />
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {COVER_PRESETS.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: url })}
                      className={`aspect-[3/4] border overflow-hidden cursor-pointer ${
                        form.imageUrl === url ? 'border-black ring-1 ring-black' : 'border-[#E8E8E8]'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-black/60">{tr('Ordre d’affichage', 'Display order')}</span>
                  <input
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 tabular-nums focus:outline-none"
                  />
                </label>

                <label className="flex items-center gap-2 pt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="accent-black"
                  />
                  <span>{tr('Collection publiée', 'Published')}</span>
                </label>
              </div>

              {/* Assign Products */}
              <div className="border-t border-[#E8E8E8] pt-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-black">
                    {tr('Associer des produits', 'Assign products')} ({assignedProductIds.length})
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={tr('Filtrer les produits...', 'Filter products...')}
                    className="w-full pl-9 pr-3 py-1.5 border border-[#E8E8E8] focus:border-black focus:outline-none"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-[#E8E8E8] divide-y divide-[#F0F0F0]">
                  {filteredAssignableProducts.map((p) => {
                    const checked = assignedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#FAFAFA] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setAssignedProductIds((prev) =>
                              prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                            )
                          }
                          className="accent-black"
                        />
                        <span className="truncate flex-1 text-black">{p.name}</span>
                        <span className="text-[10.5px] text-black/45 shrink-0">{p.categoryName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E8E8E8] flex items-center justify-end gap-2 bg-white">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 border border-[#E8E8E8] hover:border-black text-xs cursor-pointer"
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
          </form>
        </div>
      )}
    </div>
  );
}
