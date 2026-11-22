import React, { useEffect, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Edit3,
  X,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import {
  Category,
  CustomHomepageSection,
  StorefrontConfig,
  StoreNavigationItem,
} from '../../types/commerce';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { saveStorefrontConfig } from '../../lib/firestoreService';
import { KJ_IMAGES } from '../../lib/navigationData';
import { sanitizeId, slugify } from '../../lib/format';
import {
  ALL_BANNER_GROUPS,
  BannerGroupDefinition,
  getSectionImage,
  getSlotsForHomepageSection,
  hasCustomSectionImage,
  SectionImageSlot,
  STOREFRONT_IMAGE_LIBRARY,
} from '../../lib/storefrontMedia';
import {
  extractNavigationFromConfig,
  mergeNavigationIntoGalleryItems,
} from '../../components/admin/AdminAiAssistant';

interface AdminStorefrontProps {
  config: StorefrontConfig;
  categories: Category[];
  actorEmail: string;
  onOpenAiAssistant: () => void;
  onOpenLiveStore: () => void;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

type StoreSubTab = 'homepage' | 'banners' | 'navigation' | 'preview';

export function AdminStorefront({
  config,
  actorEmail,
  onOpenAiAssistant,
  onOpenLiveStore,
  onToast,
}: AdminStorefrontProps) {
  const { tr } = useLanguage();
  const { user, idToken } = useAuth();
  const [subTab, setSubTab] = useState<StoreSubTab>('homepage');
  const [bannerGroupTab, setBannerGroupTab] = useState<BannerGroupDefinition['id']>('homepage');
  const [draft, setDraft] = useState<StorefrontConfig>(config);
  const [navItems, setNavItems] = useState<StoreNavigationItem[]>(() =>
    extractNavigationFromConfig(config)
  );
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [openLibrarySlot, setOpenLibrarySlot] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Built-in section slide-over editor
  const [editingBuiltinKey, setEditingBuiltinKey] = useState<string | null>(null);

  // Add section modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    layout: 'banner' as 'banner' | 'duo',
    title: '',
    body: '',
    ctaLabel: 'Découvrir',
    ctaHref: '/shop',
    imageUrl: KJ_IMAGES.heroCampaign,
    secondaryTitle: '',
    secondaryCtaLabel: 'Explorer',
    secondaryCtaHref: '/new-in',
    secondaryImageUrl: KJ_IMAGES.bannerAfterDark,
  });

  // Inline custom section edit modal
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(config);
    setNavItems(extractNavigationFromConfig(config));
  }, [config]);

  const builtinSectionCatalog: {
    key: string;
    labelFr: string;
    labelEn: string;
    descFr: string;
    descEn: string;
  }[] = [
    {
      key: 'hero_split',
      labelFr: 'Bannière Hero Principale',
      labelEn: 'Main Split Hero Banner',
      descFr: 'Grande ouverture plein écran (2 visuels, titre et boutons)',
      descEn: 'Full-bleed opening banner (2 visuals, headline & CTAs)',
    },
    {
      key: 'new_arrivals_banner',
      labelFr: 'Bannière Nouveautés',
      labelEn: 'New Arrivals Banner',
      descFr: 'Bandeau 3 images vers les dernières sorties',
      descEn: '3-image editorial banner linking to New Arrivals',
    },
    {
      key: 'shop_by_category_strip',
      labelFr: 'Acheter par Catégorie',
      labelEn: 'Shop by Category Strip',
      descFr: 'Visuels des catégories mode (Robes, Ensembles, Chaussures...)',
      descEn: 'Fashion category visuals (Dresses, Sets, Shoes...)',
    },
    {
      key: 'kiki_men_split',
      labelFr: 'Section Kiki Men (Double)',
      labelEn: 'Kiki Men Split',
      descFr: 'Deux visuels côte à côte pour l’univers Homme',
      descEn: 'Dual side-by-side visuals for Kiki Men',
    },
    {
      key: 'kiki_sculpt_triptych',
      labelFr: 'Triptyque Kiki Sculpt & Curve',
      labelEn: 'Kiki Sculpt & Curve Triptych',
      descFr: 'Trois silhouettes éditoriales en grille',
      descEn: 'Three editorial silhouettes in a triptych',
    },
    {
      key: 'women_exclusive_banner',
      labelFr: 'Bannière Kiki Luxe',
      labelEn: 'Kiki Luxe Banner',
      descFr: 'Mise en avant Kiki Luxe (2 visuels soirée & robes)',
      descEn: 'Full-width Kiki Luxe showcase (2 evening & dress visuals)',
    },
    {
      key: 'dual_spotlight',
      labelFr: 'Double Spotlight (Filles & Garçons / Sport)',
      labelEn: 'Dual Spotlight (Girls & Boys / Sport)',
      descFr: 'Deux blocs côte à côte : Kiki Kids (Filles & Garçons) et Kiki Sport',
      descEn: 'Two full-width blocks: Kiki Kids (Girls & Boys) and Kiki Sport',
    },
    {
      key: 'shop_by_brand_strip',
      labelFr: 'Acheter par Marque',
      labelEn: 'Shop by Brand Strip',
      descFr: 'Visuels Kiki Men, Kiki Luxe, Kiki Curve, Kiki Sculpt, Kiki Sport, Kiki Kids',
      descEn: 'Brand visuals: Kiki Men, Luxe, Curve, Sculpt, Sport, Kids',
    },
    {
      key: 'trending_now_grid',
      labelFr: 'Grille Tendances (4 produits)',
      labelEn: 'Trending Now Grid (4 products)',
      descFr: 'Sélection dynamique des 4 pièces tendances',
      descEn: 'Dynamic 4-product Trending Now showcase',
    },
    {
      key: 'best_sellers_grid',
      labelFr: 'Grille Meilleures Ventes (4 produits)',
      labelEn: 'Best Sellers Grid (4 products)',
      descFr: 'Sélection dynamique des 4 best-sellers',
      descEn: 'Dynamic 4-product Best Sellers showcase',
    },
    {
      key: 'new_arrivals_grid',
      labelFr: 'Grille Nouveautés (4 produits)',
      labelEn: 'New Arrivals Grid (4 products)',
      descFr: 'Sélection dynamique des 4 dernières nouveautés',
      descEn: 'Dynamic 4-product New Arrivals showcase',
    },
    {
      key: 'featured_collections_grid',
      labelFr: 'Collections à la une (3 cartes)',
      labelEn: 'Featured Collections (3 cards)',
      descFr: 'Visuels éditoriaux des collections saisonnières',
      descEn: 'Editorial campaign visuals for seasonal collections',
    },
  ];

  const uploadImageToServer = async (file: File): Promise<string> => {
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
    return String(data.url);
  };

  const setSlotImage = (slot: SectionImageSlot, url: string) => {
    const trimmed = url.trim();
    setDraft((prev) => {
      const nextMap: Record<string, string> = { ...(prev.sectionImages || {}) };
      if (trimmed) {
        nextMap[slot.key] = trimmed;
      } else {
        delete nextMap[slot.key];
      }
      const next: StorefrontConfig = { ...prev, sectionImages: nextMap };
      if (slot.syncField === 'heroImageUrl') {
        next.heroImageUrl = trimmed || slot.defaultUrl;
      } else if (slot.syncField === 'nextDropLeftImageUrl') {
        next.nextDropLeftImageUrl = trimmed || slot.defaultUrl;
      } else if (slot.syncField === 'nextDropRightImageUrl') {
        next.nextDropRightImageUrl = trimmed || slot.defaultUrl;
      }
      return next;
    });
  };

  const resetSlotImage = (slot: SectionImageSlot) => {
    setDraft((prev) => {
      const nextMap: Record<string, string> = { ...(prev.sectionImages || {}) };
      delete nextMap[slot.key];
      const next: StorefrontConfig = { ...prev, sectionImages: nextMap };
      if (slot.syncField === 'heroImageUrl') {
        next.heroImageUrl = slot.defaultUrl;
      } else if (slot.syncField === 'nextDropLeftImageUrl') {
        next.nextDropLeftImageUrl = slot.defaultUrl;
      } else if (slot.syncField === 'nextDropRightImageUrl') {
        next.nextDropRightImageUrl = slot.defaultUrl;
      }
      return next;
    });
  };

  const handleUploadForSlot = async (slot: SectionImageSlot, file: File) => {
    setUploadingSlot(slot.key);
    try {
      const url = await uploadImageToServer(file);
      setSlotImage(slot, url);
      onToast(
        tr('Image importée. Cliquez sur Publier pour mettre en ligne.', 'Image uploaded. Click Publish to go live.'),
        'success'
      );
    } catch (err: any) {
      onToast(err?.message || tr('Échec de l’import d’image.', 'Image upload failed.'), 'error');
    } finally {
      setUploadingSlot(null);
    }
  };

  const getSectionDisplay = (rawKey: string) => {
    const hidden = rawKey.startsWith('hidden:');
    const cleanKey = rawKey.replace(/^hidden:/, '');
    if (cleanKey.startsWith('custom:')) {
      const cid = cleanKey.replace(/^custom:/, '');
      const custom = (draft.customSections || []).find((c) => c.id === cid);
      const thumbs = custom
        ? [custom.imageUrl, custom.layout === 'duo' ? custom.secondaryImageUrl : null].filter(Boolean) as string[]
        : [];
      return {
        cleanKey,
        hidden,
        isCustom: true,
        custom,
        slots: [] as SectionImageSlot[],
        thumbs,
        label: custom?.title || cid,
        desc:
          custom?.layout === 'duo'
            ? tr('Bloc personnalisé double', 'Custom duo section')
            : tr('Bannière personnalisée', 'Custom banner section'),
      };
    }
    const found = builtinSectionCatalog.find((b) => b.key === cleanKey);
    const slots = getSlotsForHomepageSection(cleanKey);
    const thumbs = slots
      .slice(0, 3)
      .map((s) => getSectionImage(draft, s.key, s.defaultUrl));
    return {
      cleanKey,
      hidden,
      isCustom: false,
      custom: undefined,
      slots,
      thumbs,
      label: found ? tr(found.labelFr, found.labelEn) : cleanKey,
      desc: found ? tr(found.descFr, found.descEn) : tr('Section boutique', 'Storefront section'),
    };
  };

  const persistConfig = async (nextConfig: StorefrontConfig, successMsg?: string) => {
    setSaving(true);
    try {
      await saveStorefrontConfig(nextConfig, actorEmail);
      setDraft(nextConfig);
      onToast(
        successMsg || tr('Boutique enregistrée et publiée.', 'Storefront changes published.'),
        'success'
      );
    } catch (err: any) {
      onToast(err?.message || tr('Échec de l’enregistrement.', 'Failed to save changes.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const sectionsList = (draft.sectionOrder || []).filter((s) => s !== 'newsletter');

  const moveSection = (index: number, delta: number) => {
    const nextIdx = index + delta;
    if (nextIdx < 0 || nextIdx >= sectionsList.length) return;
    const copy = [...sectionsList];
    const [moved] = copy.splice(index, 1);
    copy.splice(nextIdx, 0, moved);
    setDraft({ ...draft, sectionOrder: copy });
  };

  const handleDropSection = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      return;
    }
    const copy = [...sectionsList];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(targetIdx, 0, moved);
    setDraft({ ...draft, sectionOrder: copy });
    setDragIdx(null);
  };

  const toggleSectionVisibility = (index: number) => {
    const copy = [...sectionsList];
    const current = copy[index];
    copy[index] = current.startsWith('hidden:')
      ? current.replace(/^hidden:/, '')
      : `hidden:${current}`;
    setDraft({ ...draft, sectionOrder: copy });
  };

  const removeSection = (index: number) => {
    const removed = sectionsList[index];
    const clean = removed.replace(/^hidden:/, '');
    const nextOrder = sectionsList.filter((_, i) => i !== index);
    let nextCustom = draft.customSections || [];
    if (clean.startsWith('custom:')) {
      const cid = clean.replace(/^custom:/, '');
      nextCustom = nextCustom.filter((c) => c.id !== cid);
    }
    setDraft({ ...draft, sectionOrder: nextOrder, customSections: nextCustom });
  };

  const addBuiltinSection = (key: string) => {
    const filtered = sectionsList.filter((s) => s.replace(/^hidden:/, '') !== key);
    setDraft({ ...draft, sectionOrder: [...filtered, key] });
    setAddModalOpen(false);
    onToast(tr('Section ajoutée. Cliquez sur Publier pour enregistrer.', 'Section added. Click Publish to save.'));
  };

  const addCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.title.trim()) return;
    const id = sanitizeId(`custom_${slugify(customForm.title)}_${Date.now().toString().slice(-4)}`);
    const newSec: CustomHomepageSection = {
      id,
      layout: customForm.layout,
      theme: 'dark',
      title: customForm.title.trim().slice(0, 120),
      body: customForm.body.trim().slice(0, 300),
      ctaLabel: customForm.ctaLabel.trim().slice(0, 50) || tr('Découvrir', 'Shop Now'),
      ctaHref: customForm.ctaHref.trim() || '/shop',
      imageUrl: customForm.imageUrl.trim() || KJ_IMAGES.heroCampaign,
      ...(customForm.layout === 'duo'
        ? {
            secondaryTitle: customForm.secondaryTitle.trim() || customForm.title.trim(),
            secondaryCtaLabel: customForm.secondaryCtaLabel.trim() || tr('Explorer', 'Explore'),
            secondaryCtaHref: customForm.secondaryCtaHref.trim() || '/new-in',
            secondaryImageUrl: customForm.secondaryImageUrl.trim() || KJ_IMAGES.bannerAfterDark,
          }
        : {}),
    };
    setDraft({
      ...draft,
      customSections: [...(draft.customSections || []), newSec].slice(0, 24),
      sectionOrder: [...sectionsList, `custom:${id}`].slice(0, 30),
    });
    setAddModalOpen(false);
    setCustomForm({
      layout: 'banner',
      title: '',
      body: '',
      ctaLabel: 'Découvrir',
      ctaHref: '/shop',
      imageUrl: KJ_IMAGES.heroCampaign,
      secondaryTitle: '',
      secondaryCtaLabel: 'Explorer',
      secondaryCtaHref: '/new-in',
      secondaryImageUrl: KJ_IMAGES.bannerAfterDark,
    });
    onToast(tr('Section personnalisée ajoutée. Cliquez sur Publier.', 'Custom section added. Click Publish.'));
  };

  const handleSaveNavigation = async () => {
    const nextConfig: StorefrontConfig = {
      ...draft,
      galleryItems: mergeNavigationIntoGalleryItems(draft.galleryItems, navItems),
    };
    await persistConfig(
      nextConfig,
      tr('Navigation de l’en-tête mise à jour.', 'Header navigation updated.')
    );
  };

  const editingCustom = editingCustomId
    ? (draft.customSections || []).find((c) => c.id === editingCustomId) || null
    : null;

  const updateEditingCustom = (patch: Partial<CustomHomepageSection>) => {
    if (!editingCustomId) return;
    setDraft({
      ...draft,
      customSections: (draft.customSections || []).map((c) =>
        c.id === editingCustomId ? { ...c, ...patch } : c
      ),
    });
  };

  const renderSlotCard = (slot: SectionImageSlot) => {
    const currentUrl = getSectionImage(draft, slot.key, slot.defaultUrl);
    const isCustomized = hasCustomSectionImage(draft, slot.key);
    const isUploading = uploadingSlot === slot.key;
    const libraryOpen = openLibrarySlot === slot.key;

    return (
      <div
        key={slot.key}
        className="border border-[#E8E8E8] bg-white p-3.5 space-y-3 text-xs"
      >
        <div className="flex gap-3 items-start">
          <div className="w-16 h-20 bg-[#F5F5F5] border border-[#E8E8E8] shrink-0 overflow-hidden">
            <img
              src={currentUrl}
              alt={tr(slot.labelFr, slot.labelEn)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-black leading-snug">
                  {tr(slot.labelFr, slot.labelEn)}
                </p>
                {(slot.descFr || slot.descEn) && (
                  <p className="text-[11px] text-black/45 leading-snug mt-0.5">
                    {tr(slot.descFr || '', slot.descEn || '')}
                  </p>
                )}
              </div>
              {isCustomized && (
                <button
                  type="button"
                  onClick={() => resetSlotImage(slot)}
                  title={tr('Rétablir l’image par défaut', 'Reset to default image')}
                  className="p-1 text-black/45 hover:text-black shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <label className="px-2.5 py-1 border border-black bg-black text-white text-[11px] font-medium inline-flex items-center gap-1 hover:bg-black/85 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>
                  {isUploading ? tr('Import...', 'Uploading...') : tr('Importer', 'Upload')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadForSlot(slot, f);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setOpenLibrarySlot(libraryOpen ? null : slot.key)}
                className={`px-2.5 py-1 border text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer ${
                  libraryOpen
                    ? 'border-black bg-[#F5F5F5] text-black'
                    : 'border-[#E8E8E8] bg-white text-black/75 hover:border-black'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>{tr('Bibliothèque', 'Library')}</span>
              </button>
              {isCustomized && (
                <span className="text-[10px] uppercase tracking-[0.08em] text-black/50 pl-1">
                  {tr('Personnalisée', 'Custom')}
                </span>
              )}
            </div>
          </div>
        </div>

        <input
          type="text"
          value={currentUrl}
          onChange={(e) => setSlotImage(slot, e.target.value)}
          placeholder="/assets/... ou https://..."
          className="w-full border border-[#E8E8E8] focus:border-black px-2.5 py-1.5 text-[11px] focus:outline-none"
        />

        {libraryOpen && (
          <div className="pt-2 border-t border-[#F0F0F0] grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto">
            {STOREFRONT_IMAGE_LIBRARY.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => {
                  setSlotImage(slot, url);
                  setOpenLibrarySlot(null);
                }}
                className={`aspect-[3/4] border overflow-hidden cursor-pointer ${
                  currentUrl === url ? 'border-black ring-1 ring-black' : 'border-[#E8E8E8] hover:border-black'
                }`}
              >
                <img
                  src={url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const editingBuiltinMeta = editingBuiltinKey
    ? builtinSectionCatalog.find((b) => b.key === editingBuiltinKey)
    : null;
  const editingBuiltinSlots = editingBuiltinKey
    ? getSlotsForHomepageSection(editingBuiltinKey)
    : [];

  const activeBannerGroup =
    ALL_BANNER_GROUPS.find((g) => g.id === bannerGroupTab) || ALL_BANNER_GROUPS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-black">
            {tr('Boutique', 'Store')}
          </h1>
          <p className="text-xs text-black/55 mt-0.5">
            {tr(
              'Gérez la page d’accueil, les images de chaque section, les marques, les catégories et la navigation.',
              'Manage homepage sections, every section banner image, brands, categories, and navigation.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="px-3.5 py-2 border border-[#E8E8E8] bg-white hover:border-black text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tr('Modifier avec l’IA', 'Edit with AI')}</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => persistConfig(draft)}
            className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer"
          >
            {saving ? tr('Publication...', 'Publishing...') : tr('Publier', 'Publish')}
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="bg-white border border-[#E8E8E8]">
        <div className="flex items-center overflow-x-auto border-b border-[#E8E8E8] px-2">
          {[
            { id: 'homepage' as StoreSubTab, label: tr('Page d’accueil', 'Homepage') },
            { id: 'banners' as StoreSubTab, label: tr('Bannières & Images', 'Banners & Images') },
            { id: 'navigation' as StoreSubTab, label: tr('Navigation', 'Navigation') },
            { id: 'preview' as StoreSubTab, label: tr('Aperçu', 'Preview') },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`px-4 py-3 text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                subTab === t.id
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-black/55 hover:text-black'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: HOMEPAGE SECTIONS */}
        {subTab === 'homepage' && (
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-black">
                  {tr('Sections de la page d’accueil', 'Homepage sections')} ({sectionsList.length})
                </h2>
                <p className="text-xs text-black/50 mt-0.5">
                  {tr(
                    'Cliquez sur « Images » sur n’importe quelle section pour changer ses visuels, ou glissez pour réorganiser.',
                    'Click "Images" on any section to change its banners, or drag to reorder.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="px-3.5 py-2 border border-black bg-white hover:bg-black hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tr('Ajouter une section', 'Add section')}</span>
              </button>
            </div>

            <div className="border border-[#E8E8E8] divide-y divide-[#F0F0F0]">
              {sectionsList.map((rawKey, idx) => {
                const info = getSectionDisplay(rawKey);
                const hasEditableImages = info.isCustom || info.slots.length > 0;
                return (
                  <div
                    key={`${rawKey}_${idx}`}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropSection(idx)}
                    className={`px-4 py-3 flex items-center justify-between gap-3 bg-white hover:bg-[#FAFAFA] transition-colors ${
                      info.hidden ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GripVertical className="w-4 h-4 text-black/30 cursor-grab shrink-0" />
                      <span className="text-[11px] font-medium tabular-nums text-black/40 w-5 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {info.thumbs.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1 shrink-0">
                          {info.thumbs.map((src, tIdx) => (
                            <div
                              key={`${src}_${tIdx}`}
                              className="w-8 h-10 bg-[#F5F5F5] border border-[#E8E8E8] overflow-hidden"
                            >
                              <img
                                src={src}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-black truncate">{info.label}</p>
                        <p className="text-[11px] text-black/45 truncate">{info.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {hasEditableImages && (
                        <button
                          type="button"
                          onClick={() => {
                            if (info.isCustom && info.custom) {
                              setEditingCustomId(info.custom.id);
                            } else {
                              setEditingBuiltinKey(info.cleanKey);
                            }
                          }}
                          className="px-2.5 py-1.5 mr-1 border border-[#E8E8E8] hover:border-black bg-white text-[11px] font-medium text-black inline-flex items-center gap-1.5 cursor-pointer"
                          title={tr('Modifier les images de cette section', 'Edit section images')}
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span className="hidden md:inline">{tr('Images', 'Images')}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => moveSection(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-black/50 hover:text-black disabled:opacity-25 cursor-pointer"
                        title={tr('Monter', 'Move up')}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 1)}
                        disabled={idx === sectionsList.length - 1}
                        className="p-1.5 text-black/50 hover:text-black disabled:opacity-25 cursor-pointer"
                        title={tr('Descendre', 'Move down')}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSectionVisibility(idx)}
                        className="p-1.5 text-black/55 hover:text-black cursor-pointer"
                        title={info.hidden ? tr('Afficher', 'Show') : tr('Masquer', 'Hide')}
                      >
                        {info.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(idx)}
                        className="p-1.5 text-black/40 hover:text-black cursor-pointer"
                        title={tr('Supprimer', 'Remove')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: BANNERS & IMAGES (ALL SECTIONS, AUDIENCES, BRANDS, CATEGORIES, COLLECTIONS) */}
        {subTab === 'banners' && (
          <div className="p-5 space-y-6 text-xs">
            {/* Announcement Bar & Hero Text Compact Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6 border-b border-[#E8E8E8]">
              <div className="border border-[#E8E8E8] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xs font-semibold text-black">
                      {tr('Barre d’annonce promotionnelle', 'Promotional announcement bar')}
                    </h2>
                    <p className="text-[11px] text-black/50 mt-0.5">
                      {tr('Affichée en haut de la page d’accueil.', 'Displayed at the top of the homepage.')}
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.campaignBannerEnabled)}
                      onChange={(e) => setDraft({ ...draft, campaignBannerEnabled: e.target.checked })}
                      className="accent-black"
                    />
                    <span className="font-medium">{tr('Activer', 'Enable')}</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={draft.campaignBannerText || ''}
                  onChange={(e) => setDraft({ ...draft, campaignBannerText: e.target.value })}
                  placeholder={tr(
                    'Ex : Livraison offerte dès 75 000 XOF — Code KIKIJONES10',
                    'e.g. Free delivery over 75,000 XOF — Code KIKIJONES10'
                  )}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="border border-[#E8E8E8] p-4 space-y-2.5">
                <h2 className="text-xs font-semibold text-black">
                  {tr('Texte & Bouton du Hero principal', 'Main Hero Headline & CTA')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={draft.heroHeadline}
                    onChange={(e) => setDraft({ ...draft, heroHeadline: e.target.value })}
                    placeholder={tr('Titre principal', 'Headline')}
                    className="w-full border border-[#E8E8E8] focus:border-black px-3 py-1.5 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={draft.heroCtaLabel || ''}
                    onChange={(e) => setDraft({ ...draft, heroCtaLabel: e.target.value })}
                    placeholder={tr('Bouton principal', 'Primary CTA')}
                    className="w-full border border-[#E8E8E8] focus:border-black px-3 py-1.5 focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={draft.heroSubheadline}
                  onChange={(e) => setDraft({ ...draft, heroSubheadline: e.target.value })}
                  placeholder={tr('Sous-titre', 'Subheadline')}
                  className="w-full border border-[#E8E8E8] focus:border-black px-3 py-1.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Category Tabs for All Storefront Banner Images */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-black">
                    {tr('Gestion des images de bannières', 'Banner Image Manager')}
                  </h2>
                  <p className="text-[11px] text-black/50 mt-0.5">
                    {tr(
                      'Importez vos propres photos ou choisissez dans la bibliothèque pour chaque section, marque (Kiki Luxe, Kiki Men...) et catégorie (Filles, Garçons, Robes...).',
                      'Upload your own images or pick from the library for every section, brand (Kiki Luxe, Kiki Men...), and category (Girls, Boys, Dresses...).'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => persistConfig(draft)}
                  className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  {saving ? tr('Publication...', 'Publishing...') : tr('Publier les images', 'Publish images')}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ALL_BANNER_GROUPS.map((group) => {
                  const active = bannerGroupTab === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setBannerGroupTab(group.id)}
                      className={`px-3.5 py-2 text-xs border transition-colors cursor-pointer ${
                        active
                          ? 'bg-black text-white border-black font-medium'
                          : 'bg-white text-black/65 border-[#E8E8E8] hover:border-black'
                      }`}
                    >
                      {tr(group.labelFr, group.labelEn)} ({group.slots.length})
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBannerGroup.slots.map((slot) => renderSlotCard(slot))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NAVIGATION */}
        {subTab === 'navigation' && (
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-black">
                  {tr('Menu principal de l’en-tête', 'Main header navigation')}
                </h2>
                <p className="text-xs text-black/50 mt-0.5">
                  {tr(
                    'Modifiez les libellés FR/EN, les liens et la visibilité du menu.',
                    'Edit FR/EN labels, destinations, and link visibility.'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNavItems((prev) => [
                      ...prev,
                      {
                        id: sanitizeId(`nav_${Date.now()}`),
                        labelFr: 'NOUVEAU LIEN',
                        labelEn: 'NEW LINK',
                        href: '/shop',
                        visible: true,
                      },
                    ])
                  }
                  className="px-3.5 py-2 border border-[#E8E8E8] hover:border-black text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tr('Ajouter un lien', 'Add link')}</span>
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveNavigation}
                  className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer"
                >
                  {tr('Enregistrer le menu', 'Save menu')}
                </button>
              </div>
            </div>

            <div className="border border-[#E8E8E8] divide-y divide-[#F0F0F0] text-xs">
              {navItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center ${
                    !item.visible ? 'opacity-50' : ''
                  }`}
                >
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={item.labelFr}
                      onChange={(e) => {
                        const copy = [...navItems];
                        copy[idx] = { ...item, labelFr: e.target.value };
                        setNavItems(copy);
                      }}
                      placeholder="Libellé FR"
                      className="w-full border border-[#E8E8E8] focus:border-black px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={item.labelEn}
                      onChange={(e) => {
                        const copy = [...navItems];
                        copy[idx] = { ...item, labelEn: e.target.value };
                        setNavItems(copy);
                      }}
                      placeholder="Label EN"
                      className="w-full border border-[#E8E8E8] focus:border-black px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => {
                        const copy = [...navItems];
                        copy[idx] = { ...item, href: e.target.value };
                        setNavItems(copy);
                      }}
                      placeholder="/shop"
                      className="w-full border border-[#E8E8E8] focus:border-black px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const copy = [...navItems];
                        const [m] = copy.splice(idx, 1);
                        copy.splice(idx - 1, 0, m);
                        setNavItems(copy);
                      }}
                      className="p-1.5 text-black/50 hover:text-black disabled:opacity-25 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === navItems.length - 1}
                      onClick={() => {
                        const copy = [...navItems];
                        const [m] = copy.splice(idx, 1);
                        copy.splice(idx + 1, 0, m);
                        setNavItems(copy);
                      }}
                      className="p-1.5 text-black/50 hover:text-black disabled:opacity-25 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...navItems];
                        copy[idx] = { ...item, visible: !item.visible };
                        setNavItems(copy);
                      }}
                      className="p-1.5 text-black/55 hover:text-black cursor-pointer"
                    >
                      {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNavItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-black/40 hover:text-black cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PREVIEW */}
        {subTab === 'preview' && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="border border-[#E8E8E8] p-4">
                <p className="text-[10.5px] uppercase tracking-[0.1em] text-black/45">
                  {tr('Sections actives', 'Visible sections')}
                </p>
                <p className="text-xl font-semibold tabular-nums text-black mt-1">
                  {sectionsList.filter((s) => !s.startsWith('hidden:')).length} / {sectionsList.length}
                </p>
              </div>
              <div className="border border-[#E8E8E8] p-4">
                <p className="text-[10.5px] uppercase tracking-[0.1em] text-black/45">
                  {tr('Bannières personnalisées', 'Custom banners')}
                </p>
                <p className="text-xl font-semibold tabular-nums text-black mt-1">
                  {Object.keys(draft.sectionImages || {}).length}
                </p>
              </div>
              <div className="border border-[#E8E8E8] p-4">
                <p className="text-[10.5px] uppercase tracking-[0.1em] text-black/45">
                  {tr('Barre d’annonce', 'Announcement bar')}
                </p>
                <p className="text-xl font-semibold text-black mt-1">
                  {draft.campaignBannerEnabled ? tr('Active', 'Active') : tr('Inactive', 'Off')}
                </p>
              </div>
            </div>

            <div className="border border-[#E8E8E8] bg-[#FAFAFA] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-black">{draft.heroHeadline}</h3>
                <p className="text-xs text-black/55 mt-0.5">{draft.heroSubheadline}</p>
              </div>
              <button
                type="button"
                onClick={onOpenLiveStore}
                className="px-4 py-2.5 bg-black text-white text-xs font-medium inline-flex items-center gap-2 hover:bg-black/85 cursor-pointer self-start sm:self-auto"
              >
                <span>{tr('Ouvrir la boutique en direct', 'Open live storefront')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Built-in Section Slide-Over Image & Content Editor */}
      {editingBuiltinKey && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/35"
            onClick={() => {
              setEditingBuiltinKey(null);
              setOpenLibrarySlot(null);
            }}
          />
          <div className="relative w-full max-w-xl bg-white h-full border-l border-[#E8E8E8] flex flex-col z-10">
            <div className="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-black">
                  {editingBuiltinMeta
                    ? tr(editingBuiltinMeta.labelFr, editingBuiltinMeta.labelEn)
                    : editingBuiltinKey}
                </h2>
                <p className="text-[11px] text-black/50 mt-0.5">
                  {tr(
                    'Modifiez les bannières affichées sur la boutique publique.',
                    'Edit the banner visuals displayed on the public storefront.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingBuiltinKey(null);
                  setOpenLibrarySlot(null);
                }}
                className="p-1.5 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Optional section text controls for Hero or Dual Spotlight */}
              {(editingBuiltinKey === 'hero_split' || editingBuiltinKey === 'hero') && (
                <div className="border border-[#E8E8E8] bg-[#FAFAFA] p-4 space-y-3">
                  <span className="font-medium text-black block">
                    {tr('Textes & boutons du Hero', 'Hero Copy & Buttons')}
                  </span>
                  <input
                    type="text"
                    value={draft.heroHeadline}
                    onChange={(e) => setDraft({ ...draft, heroHeadline: e.target.value })}
                    placeholder={tr('Titre principal', 'Headline')}
                    className="w-full border border-[#E8E8E8] bg-white focus:border-black px-3 py-2 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={draft.heroSubheadline}
                    onChange={(e) => setDraft({ ...draft, heroSubheadline: e.target.value })}
                    placeholder={tr('Sous-titre', 'Subheadline')}
                    className="w-full border border-[#E8E8E8] bg-white focus:border-black px-3 py-2 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={draft.heroCtaLabel || ''}
                      onChange={(e) => setDraft({ ...draft, heroCtaLabel: e.target.value })}
                      placeholder={tr('Bouton 1', 'Button 1')}
                      className="w-full border border-[#E8E8E8] bg-white focus:border-black px-3 py-1.5 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={draft.heroCtaHref || ''}
                      onChange={(e) => setDraft({ ...draft, heroCtaHref: e.target.value })}
                      placeholder="/new-in"
                      className="w-full border border-[#E8E8E8] bg-white focus:border-black px-3 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {(editingBuiltinKey === 'dual_spotlight' || editingBuiltinKey === 'next_drop') && (
                <div className="border border-[#E8E8E8] bg-[#FAFAFA] p-4 space-y-3">
                  <span className="font-medium text-black block">
                    {tr('Titres & liens des 2 blocs', 'Dual Block Titles & Links')}
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={draft.nextDropLeftTitle || 'Kiki Kids'}
                      onChange={(e) => setDraft({ ...draft, nextDropLeftTitle: e.target.value })}
                      placeholder="Kiki Kids"
                      className="w-full border border-[#E8E8E8] bg-white focus:border-black px-3 py-1.5 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={draft.nextDropLeftCtaHref || '/brand/kiki-kids'}
                      onChange={(e) => setDraft({ ...draft, nextDropLeftCtaHref: e.target.value })}
                      placeholder="/brand/kiki-kids"
                      className="w-full border border-[#E8E8E8] bg-white focus:border-black px-3 py-1.5 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={draft.nextDropRightTitle || 'Kiki Sport'}
                      onChange={(e) => setDraft({ ...draft, nextDropRightTitle: e.target.value })}
                      placeholder="Kiki Sport"
                      className="w-full border border-[#E8E8E8] bg-white focus:border-black px-3 py-1.5 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={draft.nextDropRightCtaHref || '/brand/kiki-sport'}
                      onChange={(e) => setDraft({ ...draft, nextDropRightCtaHref: e.target.value })}
                      placeholder="/brand/kiki-sport"
                      className="w-full border border-[#E8E8E8] bg-white focus:border-black px-3 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {editingBuiltinSlots.map((slot) => renderSlotCard(slot))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E8E8E8] flex items-center justify-end gap-2 bg-white">
              <button
                type="button"
                onClick={() => {
                  setEditingBuiltinKey(null);
                  setOpenLibrarySlot(null);
                }}
                className="px-4 py-2 border border-[#E8E8E8] hover:border-black text-xs cursor-pointer"
              >
                {tr('Fermer', 'Close')}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await persistConfig(
                    draft,
                    tr('Images de la section enregistrées et publiées.', 'Section images saved and published.')
                  );
                  setEditingBuiltinKey(null);
                  setOpenLibrarySlot(null);
                }}
                className="px-5 py-2 bg-black text-white text-xs font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer"
              >
                {saving ? tr('Publication...', 'Publishing...') : tr('Enregistrer & Publier', 'Save & Publish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/35" onClick={() => setAddModalOpen(false)} />
          <div className="relative bg-white border border-[#E8E8E8] w-full max-w-2xl max-h-[88vh] overflow-y-auto z-10 p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
              <h2 className="text-sm font-semibold text-black">
                {tr('Ajouter une section à la page d’accueil', 'Add section to homepage')}
              </h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ready-made store sections */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
                {tr('Blocs prêts à l’emploi', 'Ready-made blocks')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {builtinSectionCatalog.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => addBuiltinSection(b.key)}
                    className="text-left p-3 border border-[#E8E8E8] hover:border-black transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-medium text-black">{tr(b.labelFr, b.labelEn)}</p>
                    <p className="text-[11px] text-black/50 mt-0.5">{tr(b.descFr, b.descEn)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Editorial Banner */}
            <form onSubmit={addCustomSection} className="space-y-3 pt-4 border-t border-[#E8E8E8] text-xs">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">
                {tr('Créer une bannière personnalisée', 'Create custom banner')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-black/60">{tr('Mise en page', 'Layout')}</span>
                  <select
                    value={customForm.layout}
                    onChange={(e) => setCustomForm({ ...customForm, layout: e.target.value as any })}
                    className="w-full border border-[#E8E8E8] px-3 py-2 bg-white focus:border-black focus:outline-none"
                  >
                    <option value="banner">{tr('Bannière pleine largeur', 'Full-width banner')}</option>
                    <option value="duo">{tr('Double bloc (2 colonnes)', 'Dual split (2 columns)')}</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-black/60">{tr('Titre', 'Title')}</span>
                  <input
                    type="text"
                    required
                    value={customForm.title}
                    onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                    placeholder={tr('Ex : Capsule Soleil', 'e.g. Sun Capsule')}
                    className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-black/60">{tr('Bouton (CTA)', 'CTA label')}</span>
                  <input
                    type="text"
                    value={customForm.ctaLabel}
                    onChange={(e) => setCustomForm({ ...customForm, ctaLabel: e.target.value })}
                    className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-black/60">{tr('Lien de destination', 'Destination link')}</span>
                  <input
                    type="text"
                    value={customForm.ctaHref}
                    onChange={(e) => setCustomForm({ ...customForm, ctaHref: e.target.value })}
                    className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
                  />
                </label>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-black/60">{tr('Image de bannière', 'Banner image')}</span>
                  <label className="px-2.5 py-1 border border-[#E8E8E8] hover:border-black inline-flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingSlot === 'new_custom' ? tr('Import...', 'Uploading...') : tr('Importer', 'Upload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setUploadingSlot('new_custom');
                        try {
                          const url = await uploadImageToServer(f);
                          setCustomForm((prev) => ({ ...prev, imageUrl: url }));
                          onToast(tr('Image importée.', 'Image uploaded.'), 'success');
                        } catch (err: any) {
                          onToast(err?.message || tr('Échec de l’import.', 'Upload failed.'), 'error');
                        } finally {
                          setUploadingSlot(null);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={customForm.imageUrl}
                  onChange={(e) => setCustomForm({ ...customForm, imageUrl: e.target.value })}
                  className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white font-medium hover:bg-black/85 cursor-pointer"
              >
                {tr('Ajouter la bannière', 'Add banner')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Custom Section Modal */}
      {editingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/35" onClick={() => setEditingCustomId(null)} />
          <div className="relative bg-white border border-[#E8E8E8] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E8]">
              <h2 className="text-sm font-semibold text-black flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5" />
                <span>{tr('Modifier la section personnalisée', 'Edit custom section')}</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditingCustomId(null)}
                className="p-1 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-black/60">{tr('Titre', 'Title')}</span>
              <input
                type="text"
                value={editingCustom.title}
                onChange={(e) => updateEditingCustom({ title: e.target.value })}
                className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-black/60">{tr('Texte', 'Body')}</span>
              <textarea
                rows={2}
                value={editingCustom.body || ''}
                onChange={(e) => updateEditingCustom({ body: e.target.value })}
                className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none resize-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-black/60">CTA</span>
                <input
                  type="text"
                  value={editingCustom.ctaLabel || ''}
                  onChange={(e) => updateEditingCustom({ ctaLabel: e.target.value })}
                  className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-black/60">{tr('Lien', 'Link')}</span>
                <input
                  type="text"
                  value={editingCustom.ctaHref || ''}
                  onChange={(e) => updateEditingCustom({ ctaHref: e.target.value })}
                  className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-black/60">{tr('Image principale', 'Primary image')}</span>
                <label className="px-2.5 py-1 border border-black bg-black text-white text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>{uploadingSlot === 'edit_custom_1' ? tr('Import...', 'Uploading...') : tr('Importer', 'Upload')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploadingSlot('edit_custom_1');
                      try {
                        const url = await uploadImageToServer(f);
                        updateEditingCustom({ imageUrl: url });
                        onToast(tr('Image importée.', 'Image uploaded.'), 'success');
                      } catch (err: any) {
                        onToast(err?.message || tr('Échec de l’import.', 'Upload failed.'), 'error');
                      } finally {
                        setUploadingSlot(null);
                      }
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                value={editingCustom.imageUrl}
                onChange={(e) => updateEditingCustom({ imageUrl: e.target.value })}
                className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
              />
            </div>

            {editingCustom.layout === 'duo' && (
              <div className="space-y-2 pt-2 border-t border-[#F0F0F0]">
                <div className="flex items-center justify-between">
                  <span className="text-black/60">{tr('Image secondaire (droite)', 'Secondary image (right)')}</span>
                  <label className="px-2.5 py-1 border border-black bg-black text-white text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingSlot === 'edit_custom_2' ? tr('Import...', 'Uploading...') : tr('Importer', 'Upload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setUploadingSlot('edit_custom_2');
                        try {
                          const url = await uploadImageToServer(f);
                          updateEditingCustom({ secondaryImageUrl: url });
                          onToast(tr('Image importée.', 'Image uploaded.'), 'success');
                        } catch (err: any) {
                          onToast(err?.message || tr('Échec de l’import.', 'Upload failed.'), 'error');
                        } finally {
                          setUploadingSlot(null);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={editingCustom.secondaryImageUrl || ''}
                  onChange={(e) => updateEditingCustom({ secondaryImageUrl: e.target.value })}
                  className="w-full border border-[#E8E8E8] px-3 py-2 focus:border-black focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCustomId(null)}
                className="px-4 py-2 border border-[#E8E8E8] hover:border-black cursor-pointer"
              >
                {tr('Fermer', 'Close')}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await persistConfig(draft);
                  setEditingCustomId(null);
                }}
                className="px-4 py-2 bg-black text-white font-medium hover:bg-black/85 disabled:opacity-50 cursor-pointer"
              >
                {saving ? tr('Publication...', 'Publishing...') : tr('Enregistrer & Publier', 'Save & Publish')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
