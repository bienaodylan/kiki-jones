import React, { useState, useEffect } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Upload,
  Copy,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import {
  Category,
  CollectionBannerConfig,
  CustomHomepageSection,
  StorefrontConfig,
} from '../../types/commerce';
import { saveCategory, saveStorefrontConfig } from '../../lib/firestoreService';
import { DEFAULT_STOREFRONT_CONFIG, KIKI_JONES_IMAGES } from '../../lib/catalogDefaults';
import { uploadAdminImage } from '../../lib/imageUpload';

interface AdminStorefrontProps {
  config: StorefrontConfig;
  categories: Category[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

const BUILTIN_SECTION_LABELS: Record<string, string> = {
  hero_split: '50/50 Split Hero Campaign (Full-Bleed)',
  new_arrivals_banner: 'New Arrivals Full-Bleed Campaign Banner',
  shop_by_category_strip: 'Shop by Category 4-Column Full-Bleed Strip',
  kiki_men_split: 'Kiki Men 50/50 Split Campaign',
  kiki_sculpt_triptych: 'Kiki Sculpt & Curve 3-Column Triptych',
  women_exclusive_banner: 'Kiki Luxe Full-Bleed Widescreen Banner',
  dual_spotlight: 'Dual 50/50 Spotlight (Kiki Kids + Shoes & Sunglasses)',
  shop_by_brand_strip: 'Shop by Brand Showcase Strip (5 Labels)',
  hero: 'Hero Campaign Banner',
  new_arrivals: 'New Arrivals Campaign Banner',
  next_drop: 'Dual Spotlight Campaign',
  categories: 'Category Strip',
  fashion_discovery: 'Sculpt & Curve Triptych',
  trending: 'Kiki Luxe Campaign Banner',
  after_dark_banner: 'Kiki Luxe Campaign Banner',
  brand_intro: 'Shop by Brand Strip',
  new_drop: 'New Arrivals Banner',
  featured: 'Kiki Luxe Banner',
  mireza_world: 'Shop by Brand Strip',
};

const QUICK_ROUTES = [
  { label: 'New Arrivals (/new-in)', value: '/new-in' },
  { label: 'Shop by Brand (/brands)', value: '/brands' },
  { label: 'Shop by Category (/categories)', value: '/categories' },
  { label: 'Kiki Men (/brand/kiki-men)', value: '/brand/kiki-men' },
  { label: 'Kiki Luxe (/brand/kiki-luxe)', value: '/brand/kiki-luxe' },
  { label: 'Kiki Sculpt (/brand/kiki-sculpt)', value: '/brand/kiki-sculpt' },
  { label: 'Kiki Curve (/brand/kiki-curve)', value: '/brand/kiki-curve' },
  { label: 'Kiki Kids (/brand/kiki-kids)', value: '/brand/kiki-kids' },
  { label: 'Shoes (/category/shoes)', value: '/category/shoes' },
  { label: 'Sunglasses (/category/sunglasses)', value: '/category/sunglasses' },
  { label: 'Dresses (/category/dresses)', value: '/category/dresses' },
  { label: 'Matching Sets (/category/matching-sets)', value: '/category/matching-sets' },
];

export function AdminStorefront({
  config,
  categories,
  actorEmail,
  onToast,
}: AdminStorefrontProps) {
  const [draft, setDraft] = useState<StorefrontConfig>(config);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>('hero_0');
  const [newBlockType, setNewBlockType] = useState<'banner' | 'split' | 'duo' | string>('banner');

  useEffect(() => {
    setDraft({
      ...DEFAULT_STOREFRONT_CONFIG,
      ...config,
      sectionOrder: (config.sectionOrder || DEFAULT_STOREFRONT_CONFIG.sectionOrder).filter(
        (s) => s !== 'newsletter'
      ),
      collectionBanners:
        config.collectionBanners && config.collectionBanners.length > 0
          ? config.collectionBanners
          : DEFAULT_STOREFRONT_CONFIG.collectionBanners,
      customSections: config.customSections || [],
    });
  }, [config]);

  const handleUploadField = async (
    fieldKey: string,
    file: File | undefined,
    onUrl: (url: string) => void | Promise<void>
  ) => {
    if (!file) return;
    setUploadingField(fieldKey);
    try {
      const url = await uploadAdminImage(file);
      await onUrl(url);
      onToast('Photo importée avec succès.', 'success');
    } catch (err: any) {
      onToast(err?.message || "Impossible d'importer la photo.", 'error');
    } finally {
      setUploadingField(null);
    }
  };

  const sectionOrder = draft.sectionOrder || [];
  const customSections = draft.customSections || [];
  const collectionBanners = draft.collectionBanners || [];

  const moveSection = (idx: number, dir: -1 | 1) => {
    const order = [...sectionOrder];
    const target = idx + dir;
    if (target < 0 || target >= order.length) return;
    const temp = order[idx];
    order[idx] = order[target];
    order[target] = temp;
    setDraft({ ...draft, sectionOrder: order });
  };

  const removeSectionAt = (idx: number) => {
    const removedKey = sectionOrder[idx];
    const nextOrder = sectionOrder.filter((_, i) => i !== idx);
    let nextCustom = customSections;
    if (removedKey.startsWith('custom:')) {
      const cid = removedKey.slice('custom:'.length);
      if (!nextOrder.includes(removedKey)) {
        nextCustom = customSections.filter((c) => c.id !== cid);
      }
    }
    setDraft({ ...draft, sectionOrder: nextOrder, customSections: nextCustom });
  };

  const createCustomBlockFromBuiltin = (builtinKey: string): CustomHomepageSection => {
    const id = `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    if (builtinKey === 'next_drop') {
      return {
        id,
        layout: 'duo',
        title: draft.nextDropLeftTitle || 'The Essentials Collection',
        body: draft.nextDropLeftBody || '',
        ctaLabel: draft.nextDropLeftCtaLabel || 'Shop Essentials',
        ctaHref: draft.nextDropLeftCtaHref || '/collection/essentials',
        imageUrl: draft.nextDropLeftImageUrl || KIKI_JONES_IMAGES.nextDropBanner,
        secondaryTitle: draft.nextDropRightTitle || 'Street Collection',
        secondaryCtaLabel: draft.nextDropRightCtaLabel || 'Explore Street',
        secondaryCtaHref: draft.nextDropRightCtaHref || '/collection/street-collection',
        secondaryImageUrl: draft.nextDropRightImageUrl || KIKI_JONES_IMAGES.streetBanner,
      };
    }
    if (builtinKey === 'brand_intro') {
      return {
        id,
        layout: 'split',
        theme: 'dark',
        eyebrow: draft.brandIntroEyebrow || 'About KIKI JONES',
        title: draft.brandIntroTitle,
        body: draft.brandIntroBody,
        ctaLabel: draft.brandIntroCtaLabel || 'Explore Collections',
        ctaHref: draft.brandIntroCtaHref || '/collections',
        imageUrl: draft.brandIntroImageUrl || KIKI_JONES_IMAGES.brandIntro,
      };
    }
    return {
      id,
      layout: 'banner',
      title: draft.heroHeadline || 'KIKI JONES Campaign Banner',
      body: '',
      ctaLabel: draft.heroCtaLabel || 'Shop Now',
      ctaHref: draft.heroCtaHref || '/new-in',
      imageUrl: draft.heroImageUrl || KIKI_JONES_IMAGES.hero,
    };
  };

  const duplicateSectionAt = (idx: number) => {
    const key = sectionOrder[idx];
    let cloned: CustomHomepageSection;
    if (key.startsWith('custom:')) {
      const src = customSections.find((c) => c.id === key.slice('custom:'.length));
      if (!src) return;
      cloned = {
        ...src,
        id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: `${src.title} (Copie)`,
      };
    } else {
      cloned = createCustomBlockFromBuiltin(key);
    }
    const nextOrder = [...sectionOrder];
    const nextKey = `custom:${cloned.id}`;
    nextOrder.splice(idx + 1, 0, nextKey);
    setDraft({
      ...draft,
      sectionOrder: nextOrder,
      customSections: [...customSections, cloned],
    });
    setExpandedKey(`${nextKey}_${idx + 1}`);
    onToast('Bloc dupliqué — vous pouvez le modifier indépendamment.', 'success');
  };

  const handleAddSection = () => {
    if (newBlockType === 'banner' || newBlockType === 'split' || newBlockType === 'duo') {
      const id = `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const fresh: CustomHomepageSection = {
        id,
        layout: newBlockType,
        theme: 'dark',
        eyebrow: newBlockType === 'split' ? 'KIKI JONES Editorial' : '',
        title:
          newBlockType === 'duo'
            ? 'Left Campaign Block'
            : newBlockType === 'split'
              ? 'Editorial Split Block'
              : 'New Campaign Banner',
        body:
          newBlockType === 'banner'
            ? ''
            : 'Add your editorial copy for this section.',
        ctaLabel: 'Explore',
        ctaHref: '/collections',
        imageUrl: KIKI_JONES_IMAGES.essentialsBanner,
        ...(newBlockType === 'duo'
          ? {
              secondaryTitle: 'Right Campaign Block',
              secondaryCtaLabel: 'Shop Now',
              secondaryCtaHref: '/new-in',
              secondaryImageUrl: KIKI_JONES_IMAGES.streetBanner,
            }
          : {}),
      };
      const nextKey = `custom:${id}`;
      const nextOrder = [...sectionOrder, nextKey];
      setDraft({
        ...draft,
        sectionOrder: nextOrder,
        customSections: [...customSections, fresh],
      });
      setExpandedKey(`${nextKey}_${nextOrder.length - 1}`);
      return;
    }

    // Adding a built-in section
    if (!sectionOrder.includes(newBlockType)) {
      const nextOrder = [...sectionOrder, newBlockType];
      setDraft({ ...draft, sectionOrder: nextOrder });
      setExpandedKey(`${newBlockType}_${nextOrder.length - 1}`);
    } else {
      // Built-in section is already present -> add an independent editable copy
      const cloned = createCustomBlockFromBuiltin(newBlockType);
      const nextKey = `custom:${cloned.id}`;
      const nextOrder = [...sectionOrder, nextKey];
      setDraft({
        ...draft,
        sectionOrder: nextOrder,
        customSections: [...customSections, cloned],
      });
      setExpandedKey(`${nextKey}_${nextOrder.length - 1}`);
    }
  };

  const updateCustomSection = (id: string, patch: Partial<CustomHomepageSection>) => {
    setDraft((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    }));
  };

  const updateCollectionBanner = (id: string, patch: Partial<CollectionBannerConfig>) => {
    setDraft((prev) => ({
      ...prev,
      collectionBanners: (prev.collectionBanners || []).map((b) =>
        b.id === id ? { ...b, ...patch } : b
      ),
    }));
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveStorefrontConfig(draft, actorEmail);
      onToast('Configuration du Storefront publiée.', 'success');
    } catch {
      onToast("Échec lors de l'enregistrement de la configuration.", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (
    cat: Category,
    patch: Partial<Pick<Category, 'name' | 'description' | 'imageUrl'>>
  ) => {
    await saveCategory(
      cat.id,
      {
        name: patch.name ?? cat.name,
        slug: cat.slug,
        description: patch.description ?? cat.description,
        imageUrl: patch.imageUrl ?? cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
      actorEmail
    );
    onToast(`Catégorie ${patch.name ?? cat.name} mise à jour.`, 'success');
  };

  const getSectionDisplayTitle = (key: string): string => {
    if (key.startsWith('custom:')) {
      const found = customSections.find((c) => c.id === key.slice('custom:'.length));
      if (!found) return 'Bloc Personnalisé';
      const typeTag =
        found.layout === 'banner'
          ? 'Bannière'
          : found.layout === 'split'
            ? 'Split Texte/Image'
            : 'Double Image';
      return `${found.title || 'Sans titre'} · ${typeTag}`;
    }
    return BUILTIN_SECTION_LABELS[key] || key;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl text-black">Storefront CMS</h1>
          <p className="text-xs font-light text-black/60 mt-0.5">
            Gérez librement tous les titres, textes, boutons, images bannières, l&apos;ordre des sections, la duplication ou l&apos;ajout de nouveaux blocs sur la page d&apos;accueil.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveCms} className="space-y-8">
        {/* TOP ADD-SECTION BAR + INTERACTIVE SECTION BUILDER */}
        <div className="bg-white p-6 space-y-5 text-xs rounded-none">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl text-black flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <span>Constructeur des Sections de la Page d&apos;Accueil</span>
              </h2>
              <p className="text-[11px] font-light text-black/60 mt-1">
                Déplacez, modifiez chaque titre/image, dupliquez une section existante ou ajoutez un nouveau bloc.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={newBlockType}
                onChange={(e) => setNewBlockType(e.target.value)}
                className="rounded-none bg-[#F7F7F7] px-3 py-2.5 text-xs font-bold text-black focus:outline-none"
              >
                <optgroup label="Nouveau Bloc Personnalisé">
                  <option value="banner">Bannière Pleine Largeur (1 Image + Titre + CTA)</option>
                  <option value="split">Bloc 50/50 Texte + Image Éditoriale</option>
                  <option value="duo">Double Bloc 50/50 (2 Images Côte à Côte)</option>
                </optgroup>
                <optgroup label="Storefront Built-in Sections">
                  <option value="hero">Hero Campaign Banner</option>
                  <option value="new_arrivals">New Arrivals Grid</option>
                  <option value="next_drop">Featured Collections Duo</option>
                  <option value="categories">Audiences + Stacked Campaign Banners</option>
                  <option value="fashion_discovery">3D Editorial Runway Showcase</option>
                  <option value="trending">Trending Now / Best Sellers</option>
                  <option value="brand_intro">About KIKI JONES (Black &amp; White Split)</option>
                  <option value="mireza_world">Editorial Lookbook Gallery (4 Images)</option>
                </optgroup>
              </select>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2.5 rounded-none bg-black text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-black/85 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter Section</span>
              </button>
            </div>
          </div>

          {/* Active Sections List with Inline Editors */}
          <div className="space-y-3">
            {sectionOrder.length === 0 && (
              <div className="p-8 bg-[#F7F7F7] text-center text-black/60">
                Aucune section active. Utilisez « Ajouter Section » ci-dessus pour composer la page d&apos;accueil.
              </div>
            )}

            {sectionOrder.map((sec, idx) => {
              const rowId = `${sec}_${idx}`;
              const isOpen = expandedKey === rowId;
              const customSec = sec.startsWith('custom:')
                ? customSections.find((c) => c.id === sec.slice('custom:'.length))
                : undefined;

              return (
                <div key={rowId} className="bg-[#F7F7F7] rounded-none">
                  {/* Section Row Header */}
                  <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedKey(isOpen ? null : rowId)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="px-2 py-1 bg-black text-white text-[10px] font-bold tabular-nums rounded-none">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-bold text-sm text-black truncate">
                        {getSectionDisplayTitle(sec)}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-black/60 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-black/60 shrink-0" />
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveSection(idx, -1)}
                        disabled={idx === 0}
                        title="Monter"
                        className="p-2 bg-white hover:bg-black hover:text-white rounded-none cursor-pointer disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 1)}
                        disabled={idx === sectionOrder.length - 1}
                        title="Descendre"
                        className="p-2 bg-white hover:bg-black hover:text-white rounded-none cursor-pointer disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateSectionAt(idx)}
                        title="Dupliquer cette section"
                        className="px-2.5 py-2 bg-white hover:bg-black hover:text-white rounded-none inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dupliquer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSectionAt(idx)}
                        title="Supprimer cette section"
                        className="p-2 bg-white hover:bg-black hover:text-white text-black/70 rounded-none cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Editor Body for Each Section Type */}
                  {isOpen && (
                    <div className="px-4 pb-5 pt-2 space-y-4">
                      {/* HERO EDITOR */}
                      {sec === 'hero' && (
                        <div className="bg-white p-4 space-y-4 rounded-none">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Titre Hero
                              </span>
                              <input
                                value={draft.heroHeadline}
                                onChange={(e) =>
                                  setDraft({ ...draft, heroHeadline: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Sous-titre / Meta SEO
                              </span>
                              <input
                                value={draft.heroSubheadline}
                                onChange={(e) =>
                                  setDraft({ ...draft, heroSubheadline: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton Principal (Texte)
                              </span>
                              <input
                                value={draft.heroCtaLabel || ''}
                                onChange={(e) =>
                                  setDraft({ ...draft, heroCtaLabel: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton Principal (Lien)
                              </span>
                              <input
                                list="quick-routes"
                                value={draft.heroCtaHref || '/shop'}
                                onChange={(e) =>
                                  setDraft({ ...draft, heroCtaHref: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton Secondaire (Texte)
                              </span>
                              <input
                                value={draft.heroSecondaryCtaLabel ?? 'Nouvelle Collection'}
                                onChange={(e) =>
                                  setDraft({ ...draft, heroSecondaryCtaLabel: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton Secondaire (Lien)
                              </span>
                              <input
                                list="quick-routes"
                                value={draft.heroSecondaryCtaHref || '/collection/casquettes-tapis'}
                                onChange={(e) =>
                                  setDraft({ ...draft, heroSecondaryCtaHref: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            {draft.heroImageUrl && (
                              <div className="w-28 bg-[#F7F7F7] shrink-0 overflow-hidden">
                                <img
                                  src={draft.heroImageUrl}
                                  alt="Hero Preview"
                                  className="w-full h-auto block"
                                />
                              </div>
                            )}
                            <div className="flex-1 w-full space-y-1.5">
                              <span className="font-bold uppercase tracking-wider text-black/60 block">
                                Image Hero (URL ou Import)
                              </span>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  value={draft.heroImageUrl}
                                  onChange={(e) =>
                                    setDraft({ ...draft, heroImageUrl: e.target.value })
                                  }
                                  className="flex-1 rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                                />
                                <label className="px-4 py-2 rounded-none bg-black text-white font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{uploadingField === 'hero' ? 'Envoi...' : 'Importer'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField !== null}
                                    onChange={(e) =>
                                      handleUploadField('hero', e.target.files?.[0], (url) =>
                                        setDraft((prev) => ({ ...prev, heroImageUrl: url }))
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* NEXT DROP DUO EDITOR */}
                      {sec === 'next_drop' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Left Card */}
                          <div className="bg-white p-4 space-y-3 rounded-none">
                            <p className="font-bold uppercase tracking-wider text-black">
                              Left Card
                            </p>
                            <input
                              value={draft.nextDropLeftTitle || ''}
                              onChange={(e) =>
                                setDraft({ ...draft, nextDropLeftTitle: e.target.value })
                              }
                              placeholder="Titre gauche"
                              className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                            />
                            <textarea
                              rows={2}
                              value={draft.nextDropLeftBody || ''}
                              onChange={(e) =>
                                setDraft({ ...draft, nextDropLeftBody: e.target.value })
                              }
                              placeholder="Description gauche"
                              className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                value={draft.nextDropLeftCtaLabel || ''}
                                onChange={(e) =>
                                  setDraft({ ...draft, nextDropLeftCtaLabel: e.target.value })
                                }
                                placeholder="Texte bouton"
                                className="rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                              <input
                                list="quick-routes"
                                value={draft.nextDropLeftCtaHref || ''}
                                onChange={(e) =>
                                  setDraft({ ...draft, nextDropLeftCtaHref: e.target.value })
                                }
                                placeholder="Lien (/category/accessories)"
                                className="rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-3 items-start">
                              {draft.nextDropLeftImageUrl && (
                                <div className="w-20 bg-[#F7F7F7] shrink-0 overflow-hidden">
                                  <img
                                    src={draft.nextDropLeftImageUrl}
                                    alt="Next Drop Left"
                                    className="w-full h-auto block"
                                  />
                                </div>
                              )}
                              <div className="flex-1 flex gap-2">
                                <input
                                  value={draft.nextDropLeftImageUrl || ''}
                                  onChange={(e) =>
                                    setDraft({ ...draft, nextDropLeftImageUrl: e.target.value })
                                  }
                                  className="flex-1 min-w-0 rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                                />
                                <label className="px-3 py-2 rounded-none bg-black text-white font-bold inline-flex items-center gap-1 cursor-pointer shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField !== null}
                                    onChange={(e) =>
                                      handleUploadField('nd_left', e.target.files?.[0], (url) =>
                                        setDraft((prev) => ({
                                          ...prev,
                                          nextDropLeftImageUrl: url,
                                        }))
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Right Card */}
                          <div className="bg-white p-4 space-y-3 rounded-none">
                            <p className="font-bold uppercase tracking-wider text-black">
                              Right Card
                            </p>
                            <input
                              value={draft.nextDropRightTitle || ''}
                              onChange={(e) =>
                                setDraft({ ...draft, nextDropRightTitle: e.target.value })
                              }
                              placeholder="Titre droite"
                              className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                            />
                            <textarea
                              rows={2}
                              value={draft.nextDropRightBody || ''}
                              onChange={(e) =>
                                setDraft({ ...draft, nextDropRightBody: e.target.value })
                              }
                              placeholder="Description droite"
                              className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                value={draft.nextDropRightCtaLabel || ''}
                                onChange={(e) =>
                                  setDraft({ ...draft, nextDropRightCtaLabel: e.target.value })
                                }
                                placeholder="Texte bouton"
                                className="rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                              <input
                                list="quick-routes"
                                value={draft.nextDropRightCtaHref || ''}
                                onChange={(e) =>
                                  setDraft({ ...draft, nextDropRightCtaHref: e.target.value })
                                }
                                placeholder="Lien (/new-drop)"
                                className="rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-3 items-start">
                              {draft.nextDropRightImageUrl && (
                                <div className="w-20 bg-[#F7F7F7] shrink-0 overflow-hidden">
                                  <img
                                    src={draft.nextDropRightImageUrl}
                                    alt="Next Drop Right"
                                    className="w-full h-auto block"
                                  />
                                </div>
                              )}
                              <div className="flex-1 flex gap-2">
                                <input
                                  value={draft.nextDropRightImageUrl || ''}
                                  onChange={(e) =>
                                    setDraft({ ...draft, nextDropRightImageUrl: e.target.value })
                                  }
                                  className="flex-1 min-w-0 rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                                />
                                <label className="px-3 py-2 rounded-none bg-black text-white font-bold inline-flex items-center gap-1 cursor-pointer shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField !== null}
                                    onChange={(e) =>
                                      handleUploadField('nd_right', e.target.files?.[0], (url) =>
                                        setDraft((prev) => ({
                                          ...prev,
                                          nextDropRightImageUrl: url,
                                        }))
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CATEGORIES + STACKED BANNERS (JERSEY / BIKINI / SET) EDITOR */}
                      {sec === 'categories' && (
                        <div className="bg-white p-4 space-y-4 rounded-none">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold uppercase tracking-wider text-black">
                                Bannières Horizontales Superposées
                              </p>
                              <p className="text-[11px] font-light text-black/60">
                                Chaque bannière utilise une seule image grand format (1800×760) et un bouton d&apos;action.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((prev) => ({
                                  ...prev,
                                  collectionBanners: [
                                    ...(prev.collectionBanners || []),
                                    {
                                      id: `banner_${Date.now()}`,
                                      title: 'Nouvelle Catégorie',
                                      ctaLabel: 'Découvrir',
                                      href: '/shop',
                                      imageUrl: KIKI_JONES_IMAGES.essentialsBanner,
                                    },
                                  ],
                                }))
                              }
                              className="px-3 py-1.5 rounded-none bg-black text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Ajouter Bannière</span>
                            </button>
                          </div>

                          <div className="space-y-3">
                            {collectionBanners.map((b, bIdx) => (
                              <div
                                key={b.id}
                                className="bg-[#F7F7F7] p-3 flex flex-col md:flex-row gap-4 items-start"
                              >
                                <div className="w-full md:w-44 bg-white shrink-0 overflow-hidden">
                                  <img
                                    src={b.imageUrl}
                                    alt={b.title}
                                    className="w-full h-auto block"
                                  />
                                </div>
                                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <label className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-black/60">
                                      Titre
                                    </span>
                                    <input
                                      value={b.title}
                                      onChange={(e) =>
                                        updateCollectionBanner(b.id, { title: e.target.value })
                                      }
                                      className="w-full rounded-none bg-white px-2.5 py-2 focus:outline-none"
                                    />
                                  </label>
                                  <label className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-black/60">
                                      Texte du Bouton
                                    </span>
                                    <input
                                      value={b.ctaLabel}
                                      onChange={(e) =>
                                        updateCollectionBanner(b.id, { ctaLabel: e.target.value })
                                      }
                                      className="w-full rounded-none bg-white px-2.5 py-2 focus:outline-none"
                                    />
                                  </label>
                                  <label className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-black/60">
                                      Lien Destination
                                    </span>
                                    <input
                                      list="quick-routes"
                                      value={b.href}
                                      onChange={(e) =>
                                        updateCollectionBanner(b.id, { href: e.target.value })
                                      }
                                      className="w-full rounded-none bg-white px-2.5 py-2 focus:outline-none"
                                    />
                                  </label>
                                  <div className="sm:col-span-3 flex gap-2 items-center pt-1">
                                    <input
                                      value={b.imageUrl}
                                      onChange={(e) =>
                                        updateCollectionBanner(b.id, { imageUrl: e.target.value })
                                      }
                                      placeholder="URL image bannière"
                                      className="flex-1 rounded-none bg-white px-2.5 py-2 font-light focus:outline-none"
                                    />
                                    <label className="px-3 py-2 rounded-none bg-black text-white font-bold inline-flex items-center gap-1 cursor-pointer shrink-0">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>
                                        {uploadingField === `cb_${b.id}` ? '...' : 'Importer'}
                                      </span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingField !== null}
                                        onChange={(e) =>
                                          handleUploadField(
                                            `cb_${b.id}`,
                                            e.target.files?.[0],
                                            (url) => updateCollectionBanner(b.id, { imageUrl: url })
                                          )
                                        }
                                      />
                                    </label>
                                    {bIdx > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const arr = [...collectionBanners];
                                          const tmp = arr[bIdx];
                                          arr[bIdx] = arr[bIdx - 1];
                                          arr[bIdx - 1] = tmp;
                                          setDraft({ ...draft, collectionBanners: arr });
                                        }}
                                        className="p-2 bg-white hover:bg-black hover:text-white cursor-pointer"
                                        title="Monter"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDraft({
                                          ...draft,
                                          collectionBanners: collectionBanners.filter(
                                            (x) => x.id !== b.id
                                          ),
                                        })
                                      }
                                      className="p-2 bg-white hover:bg-black hover:text-white text-black/70 cursor-pointer"
                                      title="Supprimer bannière"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* BRAND INTRO EDITOR */}
                      {sec === 'brand_intro' && (
                        <div className="bg-white p-4 space-y-4 rounded-none">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Surtitre Rose
                              </span>
                              <input
                                value={draft.brandIntroEyebrow || ''}
                                onChange={(e) =>
                                  setDraft({ ...draft, brandIntroEyebrow: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Grand Titre
                              </span>
                              <input
                                value={draft.brandIntroTitle}
                                onChange={(e) =>
                                  setDraft({ ...draft, brandIntroTitle: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1 md:col-span-2">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Texte de Présentation
                              </span>
                              <textarea
                                rows={3}
                                value={draft.brandIntroBody}
                                onChange={(e) =>
                                  setDraft({ ...draft, brandIntroBody: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton 1 (Texte)
                              </span>
                              <input
                                value={draft.brandIntroCtaLabel || ''}
                                onChange={(e) =>
                                  setDraft({ ...draft, brandIntroCtaLabel: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton 1 (Lien)
                              </span>
                              <input
                                list="quick-routes"
                                value={draft.brandIntroCtaHref || '/shop'}
                                onChange={(e) =>
                                  setDraft({ ...draft, brandIntroCtaHref: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton 2 (Texte)
                              </span>
                              <input
                                value={draft.brandIntroSecondaryCtaLabel ?? 'Nouvelle Collection'}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    brandIntroSecondaryCtaLabel: e.target.value,
                                  })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton 2 (Lien)
                              </span>
                              <input
                                list="quick-routes"
                                value={draft.brandIntroSecondaryCtaHref || '/collection/casquettes-tapis'}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    brandIntroSecondaryCtaHref: e.target.value,
                                  })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                          </div>

                          <div className="flex gap-4 items-start">
                            {draft.brandIntroImageUrl && (
                              <div className="w-24 bg-[#F7F7F7] shrink-0 overflow-hidden">
                                <img
                                  src={draft.brandIntroImageUrl}
                                  alt="Brand Intro"
                                  className="w-full h-auto block"
                                />
                              </div>
                            )}
                            <div className="flex-1 flex gap-2">
                              <input
                                value={draft.brandIntroImageUrl}
                                onChange={(e) =>
                                  setDraft({ ...draft, brandIntroImageUrl: e.target.value })
                                }
                                className="flex-1 min-w-0 rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                              />
                              <label className="px-4 py-2 rounded-none bg-black text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadingField === 'brandIntro' ? '...' : 'Importer'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingField !== null}
                                  onChange={(e) =>
                                    handleUploadField('brandIntro', e.target.files?.[0], (url) =>
                                      setDraft((prev) => ({ ...prev, brandIntroImageUrl: url }))
                                    )
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CUSTOM / DUPLICATED SECTION EDITOR */}
                      {customSec && (
                        <div className="bg-white p-4 space-y-4 rounded-none">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Mise en Page du Bloc
                              </span>
                              <select
                                value={customSec.layout}
                                onChange={(e) =>
                                  updateCustomSection(customSec.id, {
                                    layout: e.target.value as CustomHomepageSection['layout'],
                                  })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 font-bold focus:outline-none"
                              >
                                <option value="banner">Bannière Pleine Largeur</option>
                                <option value="split">Split 50/50 Texte + Image</option>
                                <option value="duo">Double Image 50/50</option>
                              </select>
                            </label>

                            {customSec.layout === 'split' && (
                              <label className="block space-y-1">
                                <span className="font-bold uppercase tracking-wider text-black/60">
                                  Thème Couleurs
                                </span>
                                <select
                                  value={customSec.theme || 'dark'}
                                  onChange={(e) =>
                                    updateCustomSection(customSec.id, {
                                      theme: e.target.value as 'dark' | 'light',
                                    })
                                  }
                                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 font-bold focus:outline-none"
                                >
                                  <option value="dark">Fond Noir &amp; Texte Rose</option>
                                  <option value="light">Fond Blanc &amp; Texte Noir</option>
                                </select>
                              </label>
                            )}

                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Titre Principal
                              </span>
                              <input
                                value={customSec.title}
                                onChange={(e) =>
                                  updateCustomSection(customSec.id, { title: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>

                            {customSec.layout === 'split' && (
                              <label className="block space-y-1">
                                <span className="font-bold uppercase tracking-wider text-black/60">
                                  Surtitre (optionnel)
                                </span>
                                <input
                                  value={customSec.eyebrow || ''}
                                  onChange={(e) =>
                                    updateCustomSection(customSec.id, { eyebrow: e.target.value })
                                  }
                                  className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                                />
                              </label>
                            )}

                            <label className="block space-y-1 md:col-span-3">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Description / Texte (optionnel)
                              </span>
                              <textarea
                                rows={2}
                                value={customSec.body || ''}
                                onChange={(e) =>
                                  updateCustomSection(customSec.id, { body: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                              />
                            </label>

                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton (Texte)
                              </span>
                              <input
                                value={customSec.ctaLabel || ''}
                                onChange={(e) =>
                                  updateCustomSection(customSec.id, { ctaLabel: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>

                            <label className="block space-y-1">
                              <span className="font-bold uppercase tracking-wider text-black/60">
                                Bouton (Lien)
                              </span>
                              <input
                                list="quick-routes"
                                value={customSec.ctaHref || '/shop'}
                                onChange={(e) =>
                                  updateCustomSection(customSec.id, { ctaHref: e.target.value })
                                }
                                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
                              />
                            </label>
                          </div>

                          {/* Primary Image */}
                          <div className="flex gap-4 items-start">
                            {customSec.imageUrl && (
                              <div className="w-28 bg-[#F7F7F7] shrink-0 overflow-hidden">
                                <img
                                  src={customSec.imageUrl}
                                  alt={customSec.title}
                                  className="w-full h-auto block"
                                />
                              </div>
                            )}
                            <div className="flex-1 space-y-1.5">
                              <span className="font-bold uppercase tracking-wider text-black/60 block">
                                Image {customSec.layout === 'duo' ? 'Gauche' : 'du Bloc'}
                              </span>
                              <div className="flex gap-2">
                                <input
                                  value={customSec.imageUrl}
                                  onChange={(e) =>
                                    updateCustomSection(customSec.id, { imageUrl: e.target.value })
                                  }
                                  className="flex-1 rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
                                />
                                <label className="px-4 py-2 rounded-none bg-black text-white font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>
                                    {uploadingField === `custom1_${customSec.id}`
                                      ? '...'
                                      : 'Importer'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField !== null}
                                    onChange={(e) =>
                                      handleUploadField(
                                        `custom1_${customSec.id}`,
                                        e.target.files?.[0],
                                        (url) =>
                                          updateCustomSection(customSec.id, { imageUrl: url })
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Secondary Image & Title for Duo Layout */}
                          {customSec.layout === 'duo' && (
                            <div className="bg-[#F7F7F7] p-3 space-y-3">
                              <p className="font-bold uppercase tracking-wider text-black/70">
                                Bloc Droit (Duo 50/50)
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <input
                                  value={customSec.secondaryTitle || ''}
                                  onChange={(e) =>
                                    updateCustomSection(customSec.id, {
                                      secondaryTitle: e.target.value,
                                    })
                                  }
                                  placeholder="Titre droite"
                                  className="rounded-none bg-white px-3 py-2 focus:outline-none"
                                />
                                <input
                                  value={customSec.secondaryCtaLabel || ''}
                                  onChange={(e) =>
                                    updateCustomSection(customSec.id, {
                                      secondaryCtaLabel: e.target.value,
                                    })
                                  }
                                  placeholder="Texte bouton droite"
                                  className="rounded-none bg-white px-3 py-2 focus:outline-none"
                                />
                                <input
                                  list="quick-routes"
                                  value={customSec.secondaryCtaHref || ''}
                                  onChange={(e) =>
                                    updateCustomSection(customSec.id, {
                                      secondaryCtaHref: e.target.value,
                                    })
                                  }
                                  placeholder="Lien droite"
                                  className="rounded-none bg-white px-3 py-2 focus:outline-none"
                                />
                              </div>
                              <div className="flex gap-3 items-start">
                                {customSec.secondaryImageUrl && (
                                  <div className="w-24 bg-white shrink-0 overflow-hidden">
                                    <img
                                      src={customSec.secondaryImageUrl}
                                      alt={customSec.secondaryTitle || ''}
                                      className="w-full h-auto block"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 flex gap-2">
                                  <input
                                    value={customSec.secondaryImageUrl || ''}
                                    onChange={(e) =>
                                      updateCustomSection(customSec.id, {
                                        secondaryImageUrl: e.target.value,
                                      })
                                    }
                                    placeholder="Image URL droite"
                                    className="flex-1 rounded-none bg-white px-3 py-2 font-light focus:outline-none"
                                  />
                                  <label className="px-3 py-2 rounded-none bg-black text-white font-bold inline-flex items-center gap-1 cursor-pointer shrink-0">
                                    <Upload className="w-3.5 h-3.5" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={uploadingField !== null}
                                      onChange={(e) =>
                                        handleUploadField(
                                          `custom2_${customSec.id}`,
                                          e.target.files?.[0],
                                          (url) =>
                                            updateCustomSection(customSec.id, {
                                              secondaryImageUrl: url,
                                            })
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* LOOKBOOK GALLERY EDITOR (Only when mireza_world is in active sections) */}
                      {sec === 'mireza_world' && (
                        <div className="bg-white p-4 space-y-3 rounded-none">
                          <div className="flex items-center justify-between">
                            <p className="font-bold uppercase tracking-wider text-black">
                              Entrées de la Galerie Lookbook
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  galleryItems: [
                                    ...(draft.galleryItems || []),
                                    {
                                      id: `world_${Date.now()}`,
                                      title: 'Nouveau Lookbook',
                                      caption: 'KIKI JONES Campaign',
                                      imageUrl: draft.heroImageUrl,
                                      tag: 'Lookbook',
                                    },
                                  ],
                                })
                              }
                              className="px-3 py-1.5 rounded-none bg-black text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Ajouter Visuel</span>
                            </button>
                          </div>
                          {(draft.galleryItems || []).map((item, gIdx) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-[#F7F7F7] p-2.5"
                            >
                              <input
                                value={item.title}
                                onChange={(e) => {
                                  const next = [...draft.galleryItems];
                                  next[gIdx] = { ...item, title: e.target.value };
                                  setDraft({ ...draft, galleryItems: next });
                                }}
                                placeholder="Titre"
                                className="md:col-span-3 rounded-none bg-white px-2.5 py-2 focus:outline-none"
                              />
                              <input
                                value={item.tag}
                                onChange={(e) => {
                                  const next = [...draft.galleryItems];
                                  next[gIdx] = { ...item, tag: e.target.value };
                                  setDraft({ ...draft, galleryItems: next });
                                }}
                                placeholder="Tag"
                                className="md:col-span-2 rounded-none bg-white px-2.5 py-2 focus:outline-none"
                              />
                              <input
                                value={item.caption}
                                onChange={(e) => {
                                  const next = [...draft.galleryItems];
                                  next[gIdx] = { ...item, caption: e.target.value };
                                  setDraft({ ...draft, galleryItems: next });
                                }}
                                placeholder="Légende"
                                className="md:col-span-3 rounded-none bg-white px-2.5 py-2 font-light focus:outline-none"
                              />
                              <div className="md:col-span-3 flex gap-1.5">
                                <input
                                  value={item.imageUrl}
                                  onChange={(e) => {
                                    const next = [...draft.galleryItems];
                                    next[gIdx] = { ...item, imageUrl: e.target.value };
                                    setDraft({ ...draft, galleryItems: next });
                                  }}
                                  placeholder="Image URL"
                                  className="flex-1 min-w-0 rounded-none bg-white px-2.5 py-2 font-light focus:outline-none"
                                />
                                <label className="px-2.5 py-2 rounded-none bg-black text-white font-bold inline-flex items-center cursor-pointer shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField !== null}
                                    onChange={(e) =>
                                      handleUploadField(
                                        `gallery_${gIdx}`,
                                        e.target.files?.[0],
                                        (url) => {
                                          setDraft((prev) => {
                                            const next = [...prev.galleryItems];
                                            next[gIdx] = { ...next[gIdx], imageUrl: url };
                                            return { ...prev, galleryItems: next };
                                          });
                                        }
                                      )
                                    }
                                  />
                                </label>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft({
                                    ...draft,
                                    galleryItems: draft.galleryItems.filter((_, i) => i !== gIdx),
                                  })
                                }
                                className="md:col-span-1 text-black/60 hover:text-black justify-self-end cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ANNOUNCEMENT BAR, NEWSLETTER & FOOTER SETTINGS */}
        <div className="bg-white p-6 space-y-4 text-xs rounded-none">
          <h2 className="font-editorial text-2xl text-black">
            Bannière d&apos;Annonce, Newsletter &amp; Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(draft.campaignBannerEnabled)}
                  onChange={(e) =>
                    setDraft({ ...draft, campaignBannerEnabled: e.target.checked })
                  }
                  className="accent-black"
                />
                <span>Afficher la bannière d&apos;annonce en haut</span>
              </label>
              <input
                value={draft.campaignBannerText || ''}
                onChange={(e) =>
                  setDraft({ ...draft, campaignBannerText: e.target.value })
                }
                placeholder="Texte d'annonce"
                className="flex-1 rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
              />
            </div>

            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">
                Titre Newsletter (Pied de page)
              </span>
              <input
                value={draft.newsletterTitle}
                onChange={(e) => setDraft({ ...draft, newsletterTitle: e.target.value })}
                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">
                Sous-texte Newsletter
              </span>
              <input
                value={draft.newsletterBody}
                onChange={(e) => setDraft({ ...draft, newsletterBody: e.target.value })}
                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 font-light focus:outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">
                Email Support
              </span>
              <input
                value={draft.supportEmail || ''}
                onChange={(e) => setDraft({ ...draft, supportEmail: e.target.value })}
                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold uppercase tracking-wider text-black/60">
                Téléphone Support
              </span>
              <input
                value={draft.supportPhone || ''}
                onChange={(e) => setDraft({ ...draft, supportPhone: e.target.value })}
                className="w-full rounded-none bg-[#F7F7F7] px-3 py-2 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <datalist id="quick-routes">
          {QUICK_ROUTES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </datalist>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-none bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer disabled:opacity-50 hover:bg-black/85"
          >
            {saving ? 'Publication en cours...' : 'Enregistrer & Publier la Boutique'}
          </button>
        </div>
      </form>

      {/* CATEGORY CARDS QUICK EDITOR */}
      <div className="bg-white p-6 space-y-4 text-xs rounded-none">
        <h2 className="font-editorial text-2xl text-black">
          Catégories &amp; Visuels de la Grille Supérieure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#F7F7F7] p-4 flex gap-4 items-start rounded-none">
              <div className="w-16 bg-white shrink-0 overflow-hidden">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block"
                />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <input
                  defaultValue={cat.name}
                  key={`${cat.id}_name_${cat.name}`}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value !== cat.name) {
                      handleUpdateCategory(cat, { name: e.target.value.trim() });
                    }
                  }}
                  className="w-full rounded-none bg-white px-2.5 py-1.5 font-bold text-sm focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    defaultValue={cat.imageUrl}
                    key={`${cat.id}_${cat.imageUrl}`}
                    onBlur={(e) => {
                      if (e.target.value !== cat.imageUrl) {
                        handleUpdateCategory(cat, { imageUrl: e.target.value });
                      }
                    }}
                    className="flex-1 min-w-0 rounded-none bg-white px-2.5 py-1.5 font-light text-[11px] focus:outline-none"
                  />
                  <label className="px-2.5 py-1.5 rounded-none bg-black text-white font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 hover:bg-black/85">
                    <Upload className="w-3 h-3" />
                    <span>{uploadingField === `cat_${cat.id}` ? '...' : 'Importer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingField !== null}
                      onChange={(e) =>
                        handleUploadField(`cat_${cat.id}`, e.target.files?.[0], (url) =>
                          handleUpdateCategory(cat, { imageUrl: url })
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
