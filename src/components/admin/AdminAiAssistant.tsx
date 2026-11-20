import React, { useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Check,
  AlertTriangle,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  AiAssistantResponse,
  AiStoreAction,
  Category,
  Product,
  Promotion,
  StorefrontConfig,
  StoreNavigationItem,
} from '../../types/commerce';
import {
  bulkUpdateProductPrices,
  deleteCategoryAdmin,
  deleteProductAdmin,
  logAudit,
  saveCategory,
  savePromotion,
  saveStorefrontConfig,
  updateProductFieldsAdmin,
} from '../../lib/firestoreService';
import { KJ_IMAGES, PRIMARY_NAV_ITEMS } from '../../lib/navigationData';
import { getPrimaryNavLabel } from '../../lib/i18n';
import { sanitizeId, slugify } from '../../lib/format';

interface AdminAiAssistantProps {
  open: boolean;
  onClose: () => void;
  config: StorefrontConfig;
  categories: Category[];
  products: Product[];
  promotions: Promotion[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposal?: AiAssistantResponse;
  proposalStatus?: 'pending' | 'applied' | 'cancelled';
  error?: boolean;
}

export function extractNavigationFromConfig(config: StorefrontConfig): StoreNavigationItem[] {
  const custom = (config.galleryItems || []).filter(
    (g) => g.tag === 'nav_item' || g.tag === 'nav_item_hidden'
  );
  if (custom.length > 0) {
    return custom.map((g) => ({
      id: g.id,
      labelFr: g.title,
      labelEn: g.caption || g.title,
      href: g.imageUrl || '/',
      visible: g.tag === 'nav_item',
    }));
  }
  return PRIMARY_NAV_ITEMS.map((item) => ({
    id: `nav_${item.key}`,
    labelFr: getPrimaryNavLabel(item.key, item.label, 'fr'),
    labelEn: getPrimaryNavLabel(item.key, item.label, 'en'),
    href: item.href,
    visible: true,
  }));
}

export function mergeNavigationIntoGalleryItems(
  existingGallery: StorefrontConfig['galleryItems'],
  navItems: StoreNavigationItem[]
) {
  const nonNav = (existingGallery || []).filter(
    (g) => g.tag !== 'nav_item' && g.tag !== 'nav_item_hidden'
  );
  const mappedNav = navItems.slice(0, 12).map((n) => ({
    id: sanitizeId(n.id || `nav_${slugify(n.labelFr || n.labelEn || 'link')}`),
    title: (n.labelFr || n.labelEn || 'Lien').slice(0, 60),
    caption: (n.labelEn || n.labelFr || 'Link').slice(0, 60),
    imageUrl: (n.href || '/shop').slice(0, 200),
    tag: n.visible ? 'nav_item' : 'nav_item_hidden',
  }));
  return [...nonNav, ...mappedNav].slice(0, 24);
}

export function AdminAiAssistant({
  open,
  onClose,
  config,
  categories,
  products,
  promotions,
  actorEmail,
  onToast,
}: AdminAiAssistantProps) {
  const { lang, tr } = useLanguage();
  const { user, idToken } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = useMemo(
    () =>
      lang === 'fr'
        ? [
            'Ajoute une section Tendances en haut de la page d’accueil',
            'Crée un code promo KIKI15 de -15% dès 30 000 XOF',
            'Active la bannière promo : Livraison gratuite dès 75 000 XOF',
            'Change le titre principal du hero pour une campagne été chic',
          ]
        : [
            'Add a Trending Now section to the homepage',
            'Create promo code KIKI15 for 15% off orders above 30,000 XOF',
            'Enable the top promo banner: Complimentary shipping over 75,000 XOF',
            'Update the main hero headline for a sleek summer campaign',
          ],
    [lang]
  );

  const buildStoreContext = () => ({
    storefrontConfig: {
      heroHeadline: config.heroHeadline,
      heroSubheadline: config.heroSubheadline,
      heroCtaLabel: config.heroCtaLabel,
      heroCtaHref: config.heroCtaHref,
      heroSecondaryCtaLabel: config.heroSecondaryCtaLabel,
      heroSecondaryCtaHref: config.heroSecondaryCtaHref,
      heroImageUrl: config.heroImageUrl,
      campaignBannerEnabled: Boolean(config.campaignBannerEnabled),
      campaignBannerText: config.campaignBannerText || '',
      sectionOrder: config.sectionOrder || [],
      customSections: (config.customSections || []).map((s) => ({
        id: s.id,
        layout: s.layout,
        title: s.title,
        ctaHref: s.ctaHref,
      })),
      standardShippingXof: config.standardShippingXof,
      expressShippingXof: config.expressShippingXof,
      freeShippingThresholdXof: config.freeShippingThresholdXof,
      supportEmail: config.supportEmail || '',
      supportPhone: config.supportPhone || '',
    },
    navigation: extractNavigationFromConfig(config),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
    })),
    products: products.slice(0, 80).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      regularPriceXof: p.regularPriceXof,
      promoPriceXof: p.promoPriceXof ?? null,
      status: p.status,
      isNewDrop: p.isNewDrop,
      isFeatured: p.isFeatured,
      isPreorder: p.isPreorder,
    })),
    promotions: promotions.map((pr) => ({
      id: pr.id,
      code: pr.code,
      type: pr.type,
      value: pr.value,
      minOrderXof: pr.minOrderXof,
      maxUses: pr.maxUses,
      usedCount: pr.usedCount,
      endsAt: pr.endsAt ?? null,
      isActive: pr.isActive,
    })),
    availableImages: Array.from(new Set(Object.values(KJ_IMAGES))).slice(0, 24),
  });

  const scrollToBottom = () => {
    window.setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 60);
  };

  const handleSend = async (promptOverride?: string) => {
    const text = (promptOverride ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const freshToken = user ? await user.getIdToken() : idToken;
      if (!freshToken) {
        throw new Error(tr('Session administrateur expirée. Reconnectez-vous.', 'Admin session expired. Please sign in again.'));
      }

      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({
          message: text,
          history: nextHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          lang,
          storeContext: buildStoreContext(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || tr('Erreur de l’assistant IA.', 'AI Assistant request failed.'));
      }

      const assistantResponse: AiAssistantResponse = {
        reply: String(data.reply || ''),
        requiresConfirmation: Boolean(data.requiresConfirmation),
        summary: Array.isArray(data.summary) ? data.summary : [],
        actions: Array.isArray(data.actions) ? data.actions : [],
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_a`,
          role: 'assistant',
          content: assistantResponse.reply,
          proposal: assistantResponse.actions.length > 0 ? assistantResponse : undefined,
          proposalStatus: assistantResponse.actions.length > 0 ? 'pending' : undefined,
        },
      ]);
      scrollToBottom();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_err`,
          role: 'assistant',
          content: err?.message || tr('Impossible de contacter l’assistant IA.', 'Unable to reach AI Assistant.'),
          error: true,
        },
      ]);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  const executeActions = async (messageId: string, actions: AiStoreAction[]) => {
    setApplyingId(messageId);
    try {
      let workingConfig: StorefrontConfig = {
        ...config,
        sectionOrder: [...(config.sectionOrder || [])],
        customSections: [...(config.customSections || [])],
        galleryItems: [...(config.galleryItems || [])],
      };
      let configDirty = false;

      for (const action of actions) {
        const p = action.payload || {};

        switch (action.type) {
          case 'update_storefront': {
            const allowedKeys: (keyof StorefrontConfig)[] = [
              'heroHeadline',
              'heroSubheadline',
              'heroCtaLabel',
              'heroCtaHref',
              'heroSecondaryCtaLabel',
              'heroSecondaryCtaHref',
              'heroImageUrl',
              'campaignBannerEnabled',
              'campaignBannerText',
              'standardShippingXof',
              'expressShippingXof',
              'freeShippingThresholdXof',
              'supportEmail',
              'supportPhone',
              'newsletterTitle',
              'newsletterBody',
              'brandIntroTitle',
              'brandIntroBody',
            ];
            for (const key of allowedKeys) {
              if (p[key] !== undefined) {
                (workingConfig as any)[key] = p[key];
                configDirty = true;
              }
            }
            break;
          }

          case 'reorder_sections': {
            if (Array.isArray(p.sectionOrder) && p.sectionOrder.length > 0) {
              workingConfig.sectionOrder = p.sectionOrder.map(String).slice(0, 30);
              configDirty = true;
            }
            break;
          }

          case 'toggle_section': {
            const rawKey = String(p.sectionKey || '').replace(/^hidden:/, '');
            const visible = Boolean(p.visible);
            if (rawKey) {
              workingConfig.sectionOrder = workingConfig.sectionOrder.map((k) => {
                const clean = k.replace(/^hidden:/, '');
                if (clean === rawKey) return visible ? clean : `hidden:${clean}`;
                return k;
              });
              configDirty = true;
            }
            break;
          }

          case 'add_section': {
            let keyToAdd = '';
            if (p.customSection && p.customSection.title) {
              const secId = sanitizeId(
                p.customSection.id || `custom_${slugify(p.customSection.title)}_${Date.now().toString().slice(-4)}`
              );
              const nextCustom = {
                id: secId,
                layout: (['banner', 'split', 'duo'].includes(p.customSection.layout)
                  ? p.customSection.layout
                  : 'banner') as 'banner' | 'split' | 'duo',
                theme: (p.customSection.theme === 'light' ? 'light' : 'dark') as 'dark' | 'light',
                title: String(p.customSection.title).slice(0, 120),
                body: p.customSection.body ? String(p.customSection.body).slice(0, 300) : '',
                ctaLabel: p.customSection.ctaLabel ? String(p.customSection.ctaLabel).slice(0, 50) : tr('Découvrir', 'Shop Now'),
                ctaHref: p.customSection.ctaHref ? String(p.customSection.ctaHref).slice(0, 180) : '/shop',
                imageUrl: String(p.customSection.imageUrl || KJ_IMAGES.heroCampaign).slice(0, 480),
                secondaryTitle: p.customSection.secondaryTitle ? String(p.customSection.secondaryTitle).slice(0, 120) : undefined,
                secondaryCtaLabel: p.customSection.secondaryCtaLabel ? String(p.customSection.secondaryCtaLabel).slice(0, 50) : undefined,
                secondaryCtaHref: p.customSection.secondaryCtaHref ? String(p.customSection.secondaryCtaHref).slice(0, 180) : undefined,
                secondaryImageUrl: p.customSection.secondaryImageUrl ? String(p.customSection.secondaryImageUrl).slice(0, 480) : undefined,
              };
              workingConfig.customSections = [...(workingConfig.customSections || []), nextCustom].slice(0, 24);
              keyToAdd = `custom:${secId}`;
            } else if (p.sectionKey) {
              keyToAdd = String(p.sectionKey).replace(/^hidden:/, '');
            }

            if (keyToAdd) {
              const filtered = workingConfig.sectionOrder.filter(
                (k) => k.replace(/^hidden:/, '') !== keyToAdd
              );
              if (p.position === 'top') {
                filtered.splice(1, 0, keyToAdd);
              } else if (typeof p.position === 'number' && p.position >= 0 && p.position <= filtered.length) {
                filtered.splice(p.position, 0, keyToAdd);
              } else {
                filtered.push(keyToAdd);
              }
              workingConfig.sectionOrder = filtered.slice(0, 30);
              configDirty = true;
            }
            break;
          }

          case 'remove_section': {
            const rawKey = String(p.sectionKey || '').replace(/^hidden:/, '');
            if (rawKey) {
              workingConfig.sectionOrder = workingConfig.sectionOrder.filter(
                (k) => k.replace(/^hidden:/, '') !== rawKey
              );
              if (rawKey.startsWith('custom:')) {
                const cid = rawKey.replace(/^custom:/, '');
                workingConfig.customSections = (workingConfig.customSections || []).filter(
                  (c) => c.id !== cid
                );
              }
              configDirty = true;
            }
            break;
          }

          case 'update_navigation': {
            if (Array.isArray(p.items)) {
              workingConfig.galleryItems = mergeNavigationIntoGalleryItems(
                workingConfig.galleryItems,
                p.items
              );
              configDirty = true;
            }
            break;
          }

          case 'create_collection': {
            const name = String(p.name || '').trim().slice(0, 80);
            if (name) {
              await saveCategory(
                null,
                {
                  name,
                  slug: slugify(p.slug || name),
                  description: String(p.description || '').slice(0, 480),
                  imageUrl: String(p.imageUrl || KJ_IMAGES.heroCampaign).slice(0, 480),
                  sortOrder: Math.max(0, Math.round(Number(p.sortOrder ?? categories.length + 1))),
                  isActive: p.isActive !== false,
                },
                actorEmail
              );
            }
            break;
          }

          case 'update_collection': {
            const existing = categories.find((c) => c.id === p.categoryId);
            if (existing) {
              await saveCategory(
                existing.id,
                {
                  name: String(p.name ?? existing.name).slice(0, 80),
                  slug: existing.slug,
                  description: String(p.description ?? existing.description).slice(0, 480),
                  imageUrl: String(p.imageUrl ?? existing.imageUrl).slice(0, 480),
                  sortOrder: Math.max(0, Math.round(Number(p.sortOrder ?? existing.sortOrder))),
                  isActive: p.isActive !== undefined ? Boolean(p.isActive) : existing.isActive,
                },
                actorEmail
              );
            }
            break;
          }

          case 'delete_collection': {
            if (p.categoryId) {
              await deleteCategoryAdmin(String(p.categoryId), actorEmail);
            }
            break;
          }

          case 'create_promotion': {
            const code = String(p.code || '').trim().toUpperCase().slice(0, 40);
            const value = Math.max(1, Math.round(Number(p.value || 10)));
            if (code) {
              await savePromotion(
                null,
                {
                  code,
                  type: p.type === 'fixed' ? 'fixed' : 'percentage',
                  value: p.type === 'fixed' ? value : Math.min(90, value),
                  minOrderXof: Math.max(0, Math.round(Number(p.minOrderXof || 0))),
                  maxUses: Math.max(0, Math.round(Number(p.maxUses || 0))),
                  usedCount: 0,
                  startsAt: new Date().toISOString().slice(0, 10),
                  endsAt: p.endsAt ? String(p.endsAt).slice(0, 40) : null,
                  isActive: p.isActive !== false,
                },
                actorEmail
              );
            }
            break;
          }

          case 'toggle_promotion': {
            const existing = promotions.find((pr) => pr.id === p.promoId);
            if (existing) {
              await savePromotion(
                existing.id,
                {
                  code: existing.code,
                  type: existing.type,
                  value: Math.max(1, Math.round(existing.value)),
                  minOrderXof: Math.max(0, Math.round(existing.minOrderXof || 0)),
                  maxUses: Math.max(0, Math.round(existing.maxUses || 0)),
                  usedCount: Math.max(0, Math.round(existing.usedCount || 0)),
                  startsAt: existing.startsAt ?? null,
                  endsAt: existing.endsAt ?? null,
                  isActive: Boolean(p.isActive),
                },
                actorEmail
              );
            }
            break;
          }

          case 'update_product': {
            if (p.productId && p.fields && typeof p.fields === 'object') {
              const sanitized: Record<string, any> = { ...p.fields };
              if (sanitized.regularPriceXof !== undefined) {
                sanitized.regularPriceXof = Math.max(0, Math.round(Number(sanitized.regularPriceXof)));
              }
              if (sanitized.promoPriceXof !== undefined && sanitized.promoPriceXof !== null) {
                sanitized.promoPriceXof = Math.max(0, Math.round(Number(sanitized.promoPriceXof)));
              }
              await updateProductFieldsAdmin(String(p.productId), sanitized, actorEmail);
            }
            break;
          }

          case 'bulk_update_prices': {
            let targetProducts = products;
            if (p.target === 'category' && p.categoryId) {
              targetProducts = products.filter((pr) => pr.categoryId === p.categoryId);
            } else if (p.target === 'productIds' && Array.isArray(p.productIds)) {
              const idSet = new Set(p.productIds.map(String));
              targetProducts = products.filter((pr) => idSet.has(pr.id));
            }
            const pct = Math.max(0, Math.min(90, Number(p.percent || 0)));
            const updates = targetProducts.map((pr) => {
              if (p.mode === 'clear_promo') {
                return { id: pr.id, regularPriceXof: pr.regularPriceXof, promoPriceXof: null };
              }
              if (p.mode === 'set_promo_percent') {
                return {
                  id: pr.id,
                  regularPriceXof: pr.regularPriceXof,
                  promoPriceXof: Math.round((pr.regularPriceXof * (100 - pct)) / 100),
                };
              }
              if (p.mode === 'percent_increase') {
                return {
                  id: pr.id,
                  regularPriceXof: Math.round((pr.regularPriceXof * (100 + pct)) / 100),
                  promoPriceXof: pr.promoPriceXof ?? null,
                };
              }
              return {
                id: pr.id,
                regularPriceXof: Math.round((pr.regularPriceXof * (100 - pct)) / 100),
                promoPriceXof: pr.promoPriceXof ?? null,
              };
            });
            await bulkUpdateProductPrices(updates, actorEmail);
            break;
          }

          case 'delete_product': {
            if (p.productId) {
              await deleteProductAdmin(String(p.productId), actorEmail);
            }
            break;
          }
        }
      }

      if (configDirty) {
        await saveStorefrontConfig(workingConfig, actorEmail);
      }

      await logAudit(
        actorEmail,
        'AI_ASSISTANT_APPLY',
        'store',
        'ai_batch',
        `Applied ${actions.length} AI action(s): ${actions.map((a) => a.type).join(', ')}`
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, proposalStatus: 'applied' } : m))
      );
      onToast(
        tr(
          `${actions.length} modification(s) appliquée(s) en direct.`,
          `${actions.length} change(s) applied live.`
        ),
        'success'
      );
    } catch (err: any) {
      onToast(
        err?.message || tr('Erreur lors de l’application des modifications.', 'Failed to apply changes.'),
        'error'
      );
    } finally {
      setApplyingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/35" onClick={onClose} />

      <aside className="relative w-full max-w-md bg-white h-full border-l border-[#E8E8E8] flex flex-col z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E8E8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-black text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black">
                {tr('Assistant Boutique IA', 'AI Store Assistant')}
              </h2>
              <p className="text-[11px] text-black/50">
                {tr('Pilotez votre boutique en langage naturel', 'Manage your store in natural language')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                title={tr('Nouvelle conversation', 'New conversation')}
                className="p-2 text-black/50 hover:text-black cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={tr('Fermer', 'Close')}
              className="p-2 text-black/60 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAFA]">
          {messages.length === 0 ? (
            <div className="space-y-5 pt-2">
              <div className="bg-white border border-[#E8E8E8] p-4 space-y-2">
                <p className="text-xs font-semibold text-black">
                  {tr('Comment puis-je vous aider aujourd’hui ?', 'How can I help manage KIKI JONES today?')}
                </p>
                <p className="text-xs text-black/60 leading-relaxed">
                  {tr(
                    'Demandez-moi de modifier la page d’accueil, créer une collection ou un code promo, ajuster vos prix ou réorganiser votre navigation. Chaque changement est prévisualisé avant validation.',
                    'Ask me to update the homepage, create a collection or discount code, adjust prices, or reorganize navigation. Every change is previewed before confirmation.'
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-black/45">
                  {tr('Exemples rapides', 'Quick commands')}
                </p>
                <div className="space-y-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left px-3.5 py-2.5 bg-white border border-[#E8E8E8] hover:border-black text-xs text-black/80 hover:text-black transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-black text-white'
                      : msg.error
                        ? 'bg-white border border-black text-black'
                        : 'bg-white border border-[#E8E8E8] text-black'
                  }`}
                >
                  {msg.error && (
                    <div className="flex items-center gap-1.5 font-semibold mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{tr('Erreur', 'Error')}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Action Proposal Confirmation Card */}
                {msg.proposal && msg.proposal.actions.length > 0 && (
                  <div className="mt-2 w-full bg-white border border-black p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-black">
                        {tr('Modifications proposées', 'Proposed changes')} ({msg.proposal.actions.length})
                      </span>
                      {msg.proposalStatus === 'applied' && (
                        <span className="text-[10.5px] font-semibold text-black inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {tr('Appliqué', 'Applied')}
                        </span>
                      )}
                      {msg.proposalStatus === 'cancelled' && (
                        <span className="text-[10.5px] text-black/45">
                          {tr('Annulé', 'Cancelled')}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1.5 text-xs text-black/75 border-t border-[#E8E8E8] pt-2.5">
                      {(msg.proposal.summary.length > 0
                        ? msg.proposal.summary
                        : msg.proposal.actions.map((a) => a.description)
                      ).map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-black mt-0.5">&bull;</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>

                    {msg.proposalStatus === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={applyingId === msg.id}
                          onClick={() => executeActions(msg.id, msg.proposal!.actions)}
                          className="flex-1 py-2.5 bg-black text-white text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-black/85 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {applyingId === msg.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {applyingId === msg.id
                              ? tr('Application...', 'Applying...')
                              : tr('Confirmer et appliquer', 'Confirm & Apply')}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={applyingId === msg.id}
                          onClick={() =>
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === msg.id ? { ...m, proposalStatus: 'cancelled' } : m
                              )
                            )
                          }
                          className="px-4 py-2.5 border border-[#E8E8E8] hover:border-black text-[11px] font-semibold uppercase tracking-[0.12em] text-black cursor-pointer"
                        >
                          {tr('Annuler', 'Cancel')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-black/55 bg-white border border-[#E8E8E8] px-3.5 py-2.5 w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{tr('Analyse de votre boutique...', 'Analyzing your store...')}</span>
            </div>
          )}
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-[#E8E8E8] bg-white"
        >
          <div className="flex items-end gap-2 border border-[#E8E8E8] focus-within:border-black bg-white px-3 py-2">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={tr(
                'Ex : Réduis de 10% les prix de la catégorie Femme...',
                'e.g. Discount Women category prices by 10%...'
              )}
              className="flex-1 resize-none text-xs text-black placeholder:text-black/40 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={tr('Envoyer', 'Send')}
              className="p-2 bg-black text-white disabled:opacity-30 hover:bg-black/85 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
