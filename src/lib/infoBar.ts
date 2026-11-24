import { StorefrontConfig } from '../types/commerce';
import { sanitizeId } from './format';

export const INFO_BAR_TAG = 'info_bar_item';

export interface InfoBarMessage {
  id: string;
  textFr: string;
  textEn: string;
  href: string;
}

const DEFAULT_EN_FALLBACK = 'New Collection Available — Free Standard Shipping from 75,000 XOF';

/**
 * Extracts info bar messages stored in storefrontConfig (galleryItems tag === 'info_bar_item'),
 * falling back cleanly to legacy campaignBannerText when no multi-item entries exist yet.
 */
export function extractInfoBarMessages(config: StorefrontConfig): InfoBarMessage[] {
  const tagged = (config.galleryItems || [])
    .filter((g) => g.tag === INFO_BAR_TAG && typeof g.title === 'string' && g.title.trim().length > 0)
    .map((g) => ({
      id: g.id,
      textFr: g.title.trim(),
      textEn: (g.caption || '').trim(),
      href: (g.imageUrl || '').trim(),
    }));

  if (tagged.length > 0) {
    return tagged;
  }

  const fallbackText = (config.campaignBannerText || '').trim();
  if (!fallbackText) return [];

  const isDefaultFr = fallbackText.includes('Nouvelle Collection Disponible');
  return [
    {
      id: 'info_primary',
      textFr: fallbackText,
      textEn: isDefaultFr ? DEFAULT_EN_FALLBACK : '',
      href: '/new-in',
    },
  ];
}

/**
 * Returns true when the header info bar should be displayed on the storefront.
 */
export function isInfoBarActive(config: StorefrontConfig): boolean {
  if (!config.campaignBannerEnabled) return false;
  return extractInfoBarMessages(config).length > 0;
}

/**
 * Merges updated info bar messages into storefrontConfig.galleryItems while preserving
 * all navigation items, dynamic sub-menus, and gallery entries within Firestore's 24-item cap.
 */
export function mergeInfoBarIntoGallery(
  existingGallery: StorefrontConfig['galleryItems'],
  messages: InfoBarMessage[]
) {
  const withoutInfo = (existingGallery || []).filter((g) => g.tag !== INFO_BAR_TAG);
  const cleaned = messages
    .map((m, idx) => ({
      id: sanitizeId(m.id || `info_${idx + 1}`),
      textFr: m.textFr.trim().slice(0, 180),
      textEn: (m.textEn || '').trim().slice(0, 180),
      href: (m.href || '').trim().slice(0, 200),
    }))
    .filter((m) => m.textFr.length > 0)
    .slice(0, 6);

  const availableSlots = Math.max(0, 24 - withoutInfo.length);
  const mapped = cleaned.slice(0, availableSlots).map((m) => ({
    id: m.id,
    title: m.textFr,
    caption: m.textEn,
    imageUrl: m.href,
    tag: INFO_BAR_TAG,
  }));

  return [...withoutInfo, ...mapped].slice(0, 24);
}
