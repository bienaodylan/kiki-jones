import { Product, ProductVariant, AvailabilityBadge } from '../types/commerce';

export function formatXOF(amount: number): string {
  const safe = Math.round(Number.isFinite(amount) ? amount : 0);
  return `${new Intl.NumberFormat('fr-FR').format(safe)} XOF`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function sanitizeId(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned || `id_${Date.now()}`;
}

export function getAvailableStock(variant: ProductVariant): number {
  return Math.max(0, (variant.stockQty || 0) - (variant.reservedQty || 0));
}

export function getProductTotalAvailable(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + (v.isActive ? getAvailableStock(v) : 0), 0);
}

export function getProductAvailability(
  product: Product,
  variants: ProductVariant[]
): {
  primaryState: AvailabilityBadge;
  isSoldOut: boolean;
  totalAvailable: number;
  isOnSale: boolean;
} {
  const activeVariants = variants.filter((v) => v.isActive);
  const totalAvailable = getProductTotalAvailable(activeVariants);
  const isOnSale =
    typeof product.promoPriceXof === 'number' &&
    product.promoPriceXof > 0 &&
    product.promoPriceXof < product.regularPriceXof;

  if (product.isPreorder && totalAvailable === 0) {
    return { primaryState: 'PRE-ORDER', isSoldOut: false, totalAvailable: 0, isOnSale };
  }

  if (activeVariants.length === 0 || totalAvailable <= 0) {
    return { primaryState: 'SOLD OUT', isSoldOut: true, totalAvailable: 0, isOnSale };
  }

  const threshold = product.lowStockThreshold ?? 5;
  if (totalAvailable <= threshold) {
    return { primaryState: 'LOW STOCK', isSoldOut: false, totalAvailable, isOnSale };
  }

  if (isOnSale) {
    return { primaryState: 'SALE', isSoldOut: false, totalAvailable, isOnSale };
  }

  if (product.isNewDrop) {
    return { primaryState: 'NEW', isSoldOut: false, totalAvailable, isOnSale };
  }

  if (product.isBestSeller) {
    return { primaryState: 'BEST SELLER', isSoldOut: false, totalAvailable, isOnSale };
  }

  return { primaryState: 'IN STOCK', isSoldOut: false, totalAvailable, isOnSale };
}

export function getColorHex(colorName: string): string {
  const lower = colorName.toLowerCase().trim();
  if (lower.includes('black') || lower.includes('noir') || lower.includes('onyx')) {
    return '#111111';
  }
  if (lower.includes('charcoal') || lower.includes('graphite') || lower.includes('slate')) {
    return '#363636';
  }
  if (lower.includes('silver') || lower.includes('chrome') || lower.includes('platinum')) {
    return '#C8CCD0';
  }
  if (lower.includes('grey') || lower.includes('gray') || lower.includes('gris') || lower.includes('heather')) {
    return '#9EA2A8';
  }
  if (lower.includes('espresso') || lower.includes('chocolate') || lower.includes('chocolat')) {
    return '#3F271E';
  }
  if (lower.includes('mocha') || lower.includes('brown') || lower.includes('marron') || lower.includes('cognac') || lower.includes('camel') || lower.includes('rust')) {
    return '#7B5038';
  }
  if (lower.includes('taupe') || lower.includes('tan') || lower.includes('khaki') || lower.includes('nude') || lower.includes('beige') || lower.includes('sand') || lower.includes('stone') || lower.includes('oatmeal')) {
    return '#C8B49B';
  }
  if (lower.includes('olive') || lower.includes('sage') || lower.includes('hunter') || lower.includes('moss')) {
    return '#4E5B3C';
  }
  if (lower.includes('émeraude') || lower.includes('emeraude') || lower.includes('emerald') || lower.includes('green') || lower.includes('vert') || lower.includes('mint') || lower.includes('lime')) {
    return '#1B6B46';
  }
  if (lower.includes('wine') || lower.includes('burgundy') || lower.includes('bordeaux') || lower.includes('plum') || lower.includes('maroon')) {
    return '#6E1D2C';
  }
  if (lower.includes('red') || lower.includes('rouge') || lower.includes('coral') || lower.includes('corail') || lower.includes('crimson')) {
    return '#C92A35';
  }
  if (lower.includes('pink') || lower.includes('rose') || lower.includes('blush') || lower.includes('mauve') || lower.includes('fuchsia') || lower.includes('magenta')) {
    return '#D98AA8';
  }
  if (lower.includes('orange') || lower.includes('peach') || lower.includes('terracotta')) {
    return '#DC6A2B';
  }
  if (lower.includes('gold') || lower.includes('or') || lower.includes('champagne') || lower.includes('brass')) {
    return '#C8A24A';
  }
  if (lower.includes('yellow') || lower.includes('jaune') || lower.includes('lemon') || lower.includes('butter')) {
    return '#E8C547';
  }
  if (lower.includes('navy') || lower.includes('marine') || lower.includes('dark wash') || lower.includes('indigo')) {
    return '#1E2D4A';
  }
  if (lower.includes('light wash') || lower.includes('sky') || lower.includes('baby blue') || lower.includes('ice')) {
    return '#8EB6D6';
  }
  if (lower.includes('medium wash') || lower.includes('denim') || lower.includes('blue') || lower.includes('bleu') || lower.includes('cobalt') || lower.includes('royal') || lower.includes('teal') || lower.includes('aqua') || lower.includes('turquoise')) {
    return '#2F6599';
  }
  if (lower.includes('purple') || lower.includes('violet') || lower.includes('lavender') || lower.includes('lilac')) {
    return '#6B4291';
  }
  if (
    lower.includes('white') ||
    lower.includes('blanc') ||
    lower.includes('ivory') ||
    lower.includes('écru') ||
    lower.includes('ecru') ||
    lower.includes('crème') ||
    lower.includes('creme') ||
    lower.includes('cream') ||
    lower.includes('off white') ||
    lower.includes('bone') ||
    lower.includes('chalk')
  ) {
    return '#F5F2EB';
  }
  return '#1A1A1A';
}

export function formatTimestamp(ts: any): string {
  if (!ts) return '—';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
