export type ProductStatus = 'published' | 'draft' | 'archived';

export type AudienceSlug = 'women' | 'men' | 'girls' | 'boys' | 'unisex';

export type AvailabilityBadge =
  | 'IN STOCK'
  | 'LOW STOCK'
  | 'SOLD OUT'
  | 'PRE-ORDER'
  | 'NEW'
  | 'SALE'
  | 'BEST SELLER';

export type PaymentMethod =
  | 'wave'
  | 'orange_money'
  | 'mobile_money'
  | 'visa'
  | 'mastercard';

export type PaymentStatus =
  | 'pending'
  | 'awaiting_verification'
  | 'paid'
  | 'failed'
  | 'refunded';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  externalShopifyHandle?: string | null;
  images: string[];
  runwayModelImageUrl?: string | null;
  colors: string[];
  sizes: string[];
  regularPriceXof: number;
  promoPriceXof?: number | null;
  lowStockThreshold: number;
  status: ProductStatus;
  isNewDrop: boolean;
  newDropOrder: number;
  isFeatured: boolean;
  featuredOrder: number;
  isPreorder: boolean;
  preorderLimit?: number | null;
  preorderEstimateDate?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: any;
  updatedAt?: any;
  // Storefront merchandising metadata (derived or enriched for multi-audience navigation)
  audience?: AudienceSlug;
  subCategory?: string;
  brandSlug?: string;
  brandName?: string;
  collectionSlugs?: string[];
  styleTags?: string[];
  isBestSeller?: boolean;
  isTrending?: boolean;
  materialDetails?: string[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  priceXof: number;
  compareAtPriceXof?: number | null;
  stockQty: number;
  reservedQty: number;
  lowStockThreshold: number;
  weightGrams?: number | null;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface InventoryMovement {
  id: string;
  variantId: string;
  productId: string;
  sku: string;
  type: 'addition' | 'reduction' | 'correction' | 'reservation' | 'release' | 'sale' | 'import';
  deltaQty: number;
  previousQty: number;
  newQty: number;
  reason: string;
  referenceId?: string | null;
  actorEmail: string;
  createdAt?: any;
}

export interface InventoryReservation {
  id: string;
  variantId: string;
  productId: string;
  orderId: string;
  qty: number;
  status: 'active' | 'consumed' | 'released' | 'expired';
  expiresAt: string;
  createdAt?: any;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  color: string;
  size: string;
  unitPriceXof: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  deliveryMethod: string;
  shippingFeeXof: number;
  promoCode?: string | null;
  discountXof: number;
  subtotalXof: number;
  totalXof: number;
  currency: 'XOF';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber?: string;
  userId?: string | null;
  provider: PaymentMethod;
  amountXof: number;
  currency: 'XOF';
  status: PaymentStatus;
  providerReference?: string;
  webhookVerified: boolean;
  idempotencyKey: string;
  missingConfiguration?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface RefundRecord {
  id: string;
  orderId: string;
  amountXof: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  createdBy: string;
  createdAt?: any;
}

export interface Promotion {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderXof: number;
  maxUses: number;
  usedCount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  tag: string;
}

export type BuiltinHomepageSectionKey =
  | 'hero'
  | 'hero_split'
  | 'new_arrivals_banner'
  | 'shop_by_category_strip'
  | 'kiki_men_split'
  | 'kiki_sculpt_triptych'
  | 'women_exclusive_banner'
  | 'dual_spotlight'
  | 'shop_by_brand_strip'
  | 'trending_now_grid'
  | 'best_sellers_grid'
  | 'new_arrivals_grid'
  | 'featured_collections_grid'
  | 'new_arrivals'
  | 'categories'
  | 'next_drop'
  | 'fashion_discovery'
  | 'trending'
  | 'after_dark_banner'
  | 'brand_intro'
  | 'new_drop'
  | 'featured'
  | 'mireza_world'
  | 'newsletter';

export type HomepageSectionKey = BuiltinHomepageSectionKey | (string & {});

export interface CollectionBannerConfig {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
}

export interface CustomHomepageSection {
  id: string;
  layout: 'banner' | 'split' | 'duo';
  theme?: 'dark' | 'light';
  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl: string;
  secondaryTitle?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryImageUrl?: string;
}

export interface StoreNavigationItem {
  id: string;
  labelFr: string;
  labelEn: string;
  href: string;
  visible: boolean;
}

export interface AiStoreAction {
  type:
    | 'update_storefront'
    | 'reorder_sections'
    | 'add_section'
    | 'remove_section'
    | 'toggle_section'
    | 'create_collection'
    | 'update_collection'
    | 'delete_collection'
    | 'create_promotion'
    | 'toggle_promotion'
    | 'update_product'
    | 'bulk_update_prices'
    | 'delete_product'
    | 'update_navigation';
  description: string;
  sensitive?: boolean;
  payload: Record<string, any>;
}

export interface AiAssistantResponse {
  reply: string;
  requiresConfirmation: boolean;
  summary: string[];
  actions: AiStoreAction[];
}

export interface StorefrontConfig {
  cmsVersion?: number;
  heroImageUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaHref?: string;
  nextDropLeftTitle?: string;
  nextDropLeftBody?: string;
  nextDropLeftCtaLabel?: string;
  nextDropLeftCtaHref?: string;
  nextDropLeftImageUrl?: string;
  nextDropRightTitle?: string;
  nextDropRightBody?: string;
  nextDropRightCtaLabel?: string;
  nextDropRightCtaHref?: string;
  nextDropRightImageUrl?: string;
  brandIntroEyebrow?: string;
  brandIntroTitle: string;
  brandIntroBody: string;
  brandIntroImageUrl: string;
  brandIntroCtaLabel?: string;
  brandIntroCtaHref?: string;
  brandIntroSecondaryCtaLabel?: string;
  brandIntroSecondaryCtaHref?: string;
  sectionOrder: HomepageSectionKey[];
  sectionImages?: Record<string, string>;
  collectionBanners?: CollectionBannerConfig[];
  customSections?: CustomHomepageSection[];
  galleryItems: GalleryItem[];
  newsletterTitle: string;
  newsletterBody: string;
  campaignBannerText?: string;
  campaignBannerEnabled?: boolean;
  standardShippingXof: number;
  expressShippingXof: number;
  freeShippingThresholdXof: number;
  supportEmail?: string;
  supportPhone?: string;
  updatedAt?: any;
}

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  unitPriceXof: number;
  quantity: number;
  imageUrl: string;
  isPreorder?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  phone?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CustomerAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
  createdAt?: any;
}

export interface ImportJob {
  id: string;
  filename: string;
  format: 'shopify' | 'mireza';
  mode: 'create_only' | 'update_only' | 'upsert' | 'skip_existing';
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  actorEmail: string;
  createdAt?: any;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt?: any;
}

export interface PaymentProviderStatus {
  id: PaymentMethod;
  name: string;
  region: string;
  configured: boolean;
  missingEnvVars: string[];
  webhookPath: string;
}
