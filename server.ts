import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { GoogleGenAI, Type } from '@google/genai';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };
import {
  detectMissingMenusFromInventory,
  DynamicSubMenu,
  MenuSuggestion,
} from './src/lib/menuDiscovery';
import { MegaMenuKey } from './src/lib/navigationData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore(getApps()[0], firebaseConfig.firestoreDatabaseId);
const BOOTSTRAPPED_ADMIN_EMAIL = 'bienaodylan428@gmail.com';

interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

function getProviderStatuses() {
  return [
    {
      id: 'wave',
      name: 'Wave Mobile Money',
      region: 'West Africa (UEMOA / XOF)',
      configured: Boolean(process.env.WAVE_API_KEY && process.env.WAVE_WEBHOOK_SECRET),
      missingEnvVars: [
        !process.env.WAVE_API_KEY ? 'WAVE_API_KEY' : '',
        !process.env.WAVE_WEBHOOK_SECRET ? 'WAVE_WEBHOOK_SECRET' : '',
      ].filter(Boolean),
      webhookPath: '/api/payments/webhook/wave',
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      region: 'West Africa (XOF)',
      configured: Boolean(
        process.env.ORANGE_MONEY_MERCHANT_KEY && process.env.ORANGE_MONEY_WEBHOOK_SECRET
      ),
      missingEnvVars: [
        !process.env.ORANGE_MONEY_MERCHANT_KEY ? 'ORANGE_MONEY_MERCHANT_KEY' : '',
        !process.env.ORANGE_MONEY_WEBHOOK_SECRET ? 'ORANGE_MONEY_WEBHOOK_SECRET' : '',
      ].filter(Boolean),
      webhookPath: '/api/payments/webhook/orange_money',
    },
    {
      id: 'mobile_money',
      name: 'MTN / Moov Mobile Money',
      region: 'West Africa (XOF)',
      configured: Boolean(
        process.env.MOBILE_MONEY_API_KEY && process.env.MOBILE_MONEY_WEBHOOK_SECRET
      ),
      missingEnvVars: [
        !process.env.MOBILE_MONEY_API_KEY ? 'MOBILE_MONEY_API_KEY' : '',
        !process.env.MOBILE_MONEY_WEBHOOK_SECRET ? 'MOBILE_MONEY_WEBHOOK_SECRET' : '',
      ].filter(Boolean),
      webhookPath: '/api/payments/webhook/mobile_money',
    },
    {
      id: 'visa',
      name: 'Visa Card Gateway',
      region: 'International (XOF Settlement)',
      configured: Boolean(process.env.CARD_GATEWAY_SECRET_KEY && process.env.CARD_WEBHOOK_SECRET),
      missingEnvVars: [
        !process.env.CARD_GATEWAY_SECRET_KEY ? 'CARD_GATEWAY_SECRET_KEY' : '',
        !process.env.CARD_WEBHOOK_SECRET ? 'CARD_WEBHOOK_SECRET' : '',
      ].filter(Boolean),
      webhookPath: '/api/payments/webhook/visa',
    },
    {
      id: 'mastercard',
      name: 'Mastercard Gateway',
      region: 'International (XOF Settlement)',
      configured: Boolean(process.env.CARD_GATEWAY_SECRET_KEY && process.env.CARD_WEBHOOK_SECRET),
      missingEnvVars: [
        !process.env.CARD_GATEWAY_SECRET_KEY ? 'CARD_GATEWAY_SECRET_KEY' : '',
        !process.env.CARD_WEBHOOK_SECRET ? 'CARD_WEBHOOK_SECRET' : '',
      ].filter(Boolean),
      webhookPath: '/api/payments/webhook/mastercard',
    },
  ];
}

function getWebhookSecretForProvider(provider: string): string | undefined {
  switch (provider) {
    case 'wave':
      return process.env.WAVE_WEBHOOK_SECRET;
    case 'orange_money':
      return process.env.ORANGE_MONEY_WEBHOOK_SECRET;
    case 'mobile_money':
      return process.env.MOBILE_MONEY_WEBHOOK_SECRET;
    case 'visa':
    case 'mastercard':
      return process.env.CARD_WEBHOOK_SECRET;
    default:
      return undefined;
  }
}

async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    const user = req.user;
    if (!user || !user.email_verified) {
      res.status(403).json({ error: 'Verified email required for administrator access' });
      return;
    }
    if (user.email === BOOTSTRAPPED_ADMIN_EMAIL) {
      next();
      return;
    }
    try {
      const adminDoc = await adminDb.collection('admins').doc(user.uid).get();
      if (adminDoc.exists) {
        next();
        return;
      }
      res.status(403).json({ error: 'Administrator privileges required' });
    } catch {
      res.status(403).json({ error: 'Unable to verify administrator role' });
    }
  });
}

function verifyHmacSignature(payload: string, signatureHeader: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const cleanHeader = signatureHeader.replace(/^sha256=/i, '').trim();
  const bufA = Buffer.from(expected, 'utf8');
  const bufB = Buffer.from(cleanHeader, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function startServer() {
  const app = express();
  const uploadsDir = path.resolve(__dirname, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
      },
    })
  );

  app.use('/uploads', express.static(uploadsDir));

  // Health & Readiness
  app.get('/api/health', async (_req, res) => {
    let adminFirestoreReady = false;
    try {
      await adminDb.collection('test').doc('connection').get();
      adminFirestoreReady = true;
    } catch {
      adminFirestoreReady = false;
    }
    res.json({
      status: 'ok',
      brand: 'KIKI JONES',
      currency: 'XOF',
      adminFirestoreReady,
      paymentProviders: getProviderStatuses(),
    });
  });

  // Payment provider readiness
  app.get('/api/payments/providers', (_req, res) => {
    res.json({ providers: getProviderStatuses() });
  });

  // Protected Admin Session Verification
  app.get('/api/admin/verify', requireAdmin, (req: AuthRequest, res) => {
    res.json({
      verified: true,
      uid: req.user?.uid,
      email: req.user?.email,
      role: req.user?.email === BOOTSTRAPPED_ADMIN_EMAIL ? 'super_admin' : 'admin',
    });
  });

  // Protected Admin Image Upload (stores locally in /uploads for short URLs compatible with Firestore rules)
  app.post('/api/admin/upload-image', requireAdmin, (req: AuthRequest, res) => {
    try {
      const { dataUrl } = req.body || {};
      if (typeof dataUrl !== 'string') {
        res.status(400).json({ error: 'Missing image data.' });
        return;
      }
      const match = dataUrl.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/=]+)$/i);
      if (!match) {
        res.status(400).json({ error: 'Unsupported image format. Please use JPG, PNG, or WEBP.' });
        return;
      }
      const rawExt = match[1].toLowerCase();
      const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.byteLength === 0 || buffer.byteLength > 8 * 1024 * 1024) {
        res.status(400).json({ error: 'Image must be smaller than 8 MB.' });
        return;
      }
      const filename = `kikijones_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
      res.status(201).json({ url: `/uploads/${filename}` });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to store uploaded image.' });
    }
  });

  // Protected Admin AI Store Assistant (Server-Side Gemini 4 Hydrogen)
  app.post('/api/admin/ai-assistant', requireAdmin, async (req: AuthRequest, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in environment secrets to enable the AI Store Assistant.',
      });
      return;
    }

    const { message, history = [], lang = 'fr', storeContext = {} } = req.body || {};
    if (typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const responseLang = lang === 'en' ? 'English' : 'French';
    const systemInstruction = `You are the KIKI JONES AI Store Manager embedded inside the KIKI JONES luxury fashion e-commerce admin console (currency: XOF / FCFA).
Always reply concisely, clearly, and professionally in ${responseLang}.

You help the administrator manage their real store directly via structured actions.
You have the current live store snapshot in the prompt context:
- storefrontConfig: heroHeadline, heroSubheadline, heroCtaLabel, heroCtaHref, heroSecondaryCtaLabel, heroSecondaryCtaHref, heroImageUrl, campaignBannerEnabled, campaignBannerText, sectionOrder, customSections, standardShippingXof, expressShippingXof, freeShippingThresholdXof, supportEmail, supportPhone
- navigation: current header menu items [{ id, labelFr, labelEn, href, visible }]
- categories (collections): [{ id, name, slug, description, imageUrl, sortOrder, isActive }]
- products (summary): [{ id, name, slug, sku, categoryId, categoryName, regularPriceXof, promoPriceXof, status, isNewDrop, isFeatured, isPreorder }]
- promotions: [{ id, code, type, value, minOrderXof, maxUses, usedCount, endsAt, isActive }]
- availableImages: curated Fashion Nova assets already stored locally under /assets/fashionnova/...

When the admin asks a question or wants advice (no store changes needed), return actions: [] and requiresConfirmation: false.
When the admin requests changes to the store, generate one or more concrete actions in the "actions" array.

Supported action types and their exact JSON payload structure (serialize payload as a valid JSON string in payloadJson):
1. "update_storefront": partial fields of storefrontConfig (heroHeadline, heroSubheadline, heroCtaLabel, heroCtaHref, heroSecondaryCtaLabel, heroSecondaryCtaHref, heroImageUrl, campaignBannerEnabled, campaignBannerText, standardShippingXof, expressShippingXof, freeShippingThresholdXof, supportEmail, supportPhone, newsletterTitle, newsletterBody)
2. "reorder_sections": { "sectionOrder": string[] } — keep existing section keys, prefix hidden ones with "hidden:"
3. "toggle_section": { "sectionKey": string, "visible": boolean }
4. "add_section": { "sectionKey"?: "trending_now_grid" | "best_sellers_grid" | "new_arrivals_grid" | "featured_collections_grid" | "hero_split" | "new_arrivals_banner" | "shop_by_category_strip" | "kiki_men_split" | "kiki_sculpt_triptych" | "women_exclusive_banner" | "dual_spotlight" | "shop_by_brand_strip", "customSection"?: { "id": string, "layout": "banner" | "split" | "duo", "theme"?: "dark" | "light", "title": string, "body"?: string, "ctaLabel"?: string, "ctaHref"?: string, "imageUrl": string, "secondaryTitle"?: string, "secondaryCtaLabel"?: string, "secondaryCtaHref"?: string, "secondaryImageUrl"?: string }, "position"?: "top" | "bottom" | number }
5. "remove_section": { "sectionKey": string }
6. "update_navigation": { "items": [{ "id": string, "labelFr": string, "labelEn": string, "href": string, "visible": boolean }] }
7. "create_collection": { "name": string, "slug"?: string, "description": string, "imageUrl": string, "isActive"?: boolean, "sortOrder"?: number }
8. "update_collection": { "categoryId": string, "name"?: string, "description"?: string, "imageUrl"?: string, "isActive"?: boolean, "sortOrder"?: number }
9. "delete_collection": { "categoryId": string }
10. "create_promotion": { "code": string, "type": "percentage" | "fixed", "value": number, "minOrderXof"?: number, "maxUses"?: number, "endsAt"?: string | null, "isActive"?: boolean }
11. "toggle_promotion": { "promoId": string, "isActive": boolean }
12. "update_product": { "productId": string, "fields": { "name"?: string, "description"?: string, "regularPriceXof"?: number, "promoPriceXof"?: number | null, "status"?: "published" | "draft" | "archived", "isNewDrop"?: boolean, "isFeatured"?: boolean, "isPreorder"?: boolean, "categoryId"?: string, "categoryName"?: string } }
13. "bulk_update_prices": { "target": "all" | "category" | "productIds", "categoryId"?: string, "productIds"?: string[], "mode": "percent_discount" | "percent_increase" | "set_promo_percent" | "clear_promo", "percent"?: number }
14. "delete_product": { "productId": string }

Safety rules:
- Set requiresConfirmation: true whenever ANY action is present, especially for deletions, bulk price updates, navigation changes, or homepage layout edits — the admin will preview the summary and click Confirm before changes apply.
- Only reference real productId, categoryId, promoId, or sectionKey values from storeContext.
- Always pick real image paths from availableImages (never invent external URLs).
- Prices and promo values must be positive integers in XOF (or percentage 1-90).
- In "summary", list clear bullet strings describing each exact change in ${responseLang}.`;

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const recentHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((h: any) => `${h.role === 'user' ? 'Admin' : 'Assistant'}: ${String(h.content || '').slice(0, 600)}`)
            .join('\n')
        : '';

      const userPrompt = `LIVE STORE CONTEXT (JSON):
${JSON.stringify(storeContext)}

${recentHistory ? `RECENT CONVERSATION:\n${recentHistory}\n\n` : ''}ADMIN REQUEST:
${message.trim()}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Concise, helpful response to the administrator in the requested language.',
              },
              requiresConfirmation: {
                type: Type.BOOLEAN,
                description: 'True whenever actions should be reviewed and confirmed by the administrator before execution.',
              },
              summary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Human-readable bullet list summarizing the proposed store changes.',
              },
              actions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      enum: [
                        'update_storefront',
                        'reorder_sections',
                        'add_section',
                        'remove_section',
                        'toggle_section',
                        'create_collection',
                        'update_collection',
                        'delete_collection',
                        'create_promotion',
                        'toggle_promotion',
                        'update_product',
                        'bulk_update_prices',
                        'delete_product',
                        'update_navigation',
                      ],
                    },
                    description: {
                      type: Type.STRING,
                      description: 'Short label describing this specific action.',
                    },
                    sensitive: {
                      type: Type.BOOLEAN,
                      description: 'True for destructive or bulk actions.',
                    },
                    payloadJson: {
                      type: Type.STRING,
                      description: 'Valid JSON string encoding the action payload object.',
                    },
                  },
                  required: ['type', 'description', 'payloadJson'],
                },
              },
            },
            required: ['reply', 'requiresConfirmation', 'summary', 'actions'],
          },
        },
      });

      const rawText = response.text || '';
      const parsed = JSON.parse(rawText);
      const normalizedActions = Array.isArray(parsed.actions)
        ? parsed.actions.map((a: any) => {
            let payload: Record<string, any> = {};
            try {
              payload = typeof a.payloadJson === 'string' ? JSON.parse(a.payloadJson) : a.payload || {};
            } catch {
              payload = {};
            }
            return {
              type: a.type,
              description: String(a.description || a.type),
              sensitive: Boolean(a.sensitive),
              payload,
            };
          })
        : [];

      res.json({
        reply: String(parsed.reply || ''),
        requiresConfirmation: normalizedActions.length > 0 ? true : Boolean(parsed.requiresConfirmation),
        summary: Array.isArray(parsed.summary) ? parsed.summary.map(String) : [],
        actions: normalizedActions,
      });
    } catch (error: any) {
      res.status(502).json({
        error: error?.message || 'AI Store Assistant request failed.',
      });
    }
  });

  // Protected Admin Smart Inventory-to-Menu Detector (Taxonomy + Optional Gemini 4 Hydrogen)
  app.post('/api/admin/analyze-menus', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const {
        products: clientProducts = [],
        existingDynamic = [],
        dismissedSlugs = [],
      } = req.body || {};

      let liveProducts: any[] = [];
      let source: 'firestore' | 'client_snapshot' = 'client_snapshot';

      try {
        const snap = await adminDb.collection('products').get();
        if (!snap.empty) {
          liveProducts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
          source = 'firestore';
        }
      } catch {
        // Fallback to authenticated admin's client snapshot when ADC is not attached in preview
      }

      if (liveProducts.length === 0 && Array.isArray(clientProducts)) {
        liveProducts = clientProducts;
      }

      const activeProducts = liveProducts.filter((p) => p && p.status !== 'archived');
      const safeExisting: DynamicSubMenu[] = Array.isArray(existingDynamic) ? existingDynamic : [];
      const safeDismissed: string[] = Array.isArray(dismissedSlugs)
        ? dismissedSlugs.map(String)
        : [];

      const taxonomySuggestions = detectMissingMenusFromInventory(
        activeProducts,
        safeExisting,
        safeDismissed
      );

      let aiEnhanced = false;
      const mergedSuggestions: MenuSuggestion[] = [...taxonomySuggestions];

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && activeProducts.length > 0) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          });

          const existingSlugs = new Set<string>([
            ...safeExisting.map((e) => e.slug.toLowerCase()),
            ...safeDismissed.map((s) => s.toLowerCase()),
            ...taxonomySuggestions.map((t) => t.slug.toLowerCase()),
          ]);

          const compactInventory = activeProducts.slice(0, 120).map((p) => ({
            id: String(p.id || ''),
            name: String(p.name || ''),
            audience: String(p.audience || ''),
            subCategory: String(p.subCategory || ''),
            styleTags: Array.isArray(p.styleTags) ? p.styleTags.slice(0, 5) : [],
            description: String(p.description || '').slice(0, 140),
          }));

          const aiResp = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: `Analyze this warm-climate luxury fashion inventory for KIKI JONES and identify up to 4 ADDITIONAL distinct garment cuts, styles, or silhouettes that exist in the inventory (e.g., flared jeans, halter tops, linen trousers, cut-out dresses, mesh shirts, etc.) and deserve their own sub-menu, EXCLUDING any slug in this list: ${JSON.stringify(Array.from(existingSlugs))}.

INVENTORY:
${JSON.stringify(compactInventory)}`,
            config: {
              systemInstruction:
                'You are a fashion merchandiser for KIKI JONES (warm-climate Africa luxury fashion, zero winter wear). Only suggest sub-menus genuinely backed by at least 1 real product in the provided inventory JSON. Return valid JSON only.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  suggestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        slug: { type: Type.STRING },
                        labelFr: { type: Type.STRING },
                        labelEn: { type: Type.STRING },
                        parentMegaMenuKey: {
                          type: Type.STRING,
                          enum: [
                            'dresses',
                            'bottoms',
                            'tops',
                            'matching-sets',
                            'shoes',
                            'accessories',
                            'sport',
                            'women',
                            'men',
                            'curve',
                            'kids',
                            'categories',
                          ],
                        },
                        matchedProductIds: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        reasonFr: { type: Type.STRING },
                        reasonEn: { type: Type.STRING },
                      },
                      required: [
                        'slug',
                        'labelFr',
                        'labelEn',
                        'parentMegaMenuKey',
                        'matchedProductIds',
                        'reasonFr',
                        'reasonEn',
                      ],
                    },
                  },
                },
                required: ['suggestions'],
              },
            },
          });

          const parsed = JSON.parse(aiResp.text || '{}');
          if (Array.isArray(parsed.suggestions)) {
            aiEnhanced = true;
            const byId = new Map<string, any>(activeProducts.map((p) => [String(p.id), p]));

            for (const item of parsed.suggestions) {
              const cleanSlug = String(item.slug || '')
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 48);
              if (!cleanSlug || existingSlugs.has(cleanSlug)) continue;

              const verifiedProducts = Array.isArray(item.matchedProductIds)
                ? item.matchedProductIds
                    .map((id: string) => byId.get(String(id)))
                    .filter(Boolean)
                : [];

              if (verifiedProducts.length === 0) continue;

              const inferredDivisions = Array.from(
                new Set(
                  verifiedProducts.map((p: any) => {
                    if (p.brandSlug === 'kiki-curve') return 'curve';
                    if (p.brandSlug === 'kiki-sport' || p.subCategory === 'activewear') return 'sport';
                    if (p.audience === 'men') return 'men';
                    if (p.audience === 'girls' || p.audience === 'boys') return 'kids';
                    return 'women';
                  })
                )
              ) as MenuSuggestion['divisions'];

              existingSlugs.add(cleanSlug);
              mergedSuggestions.push({
                slug: cleanSlug,
                labelFr: String(item.labelFr || cleanSlug).slice(0, 56),
                labelEn: String(item.labelEn || item.labelFr || cleanSlug).slice(0, 56),
                href: `/category/${cleanSlug}`,
                parentMegaMenuKey: (item.parentMegaMenuKey as MegaMenuKey) || 'categories',
                divisions: inferredDivisions.length > 0 ? inferredDivisions : ['women'],
                matchedCount: verifiedProducts.length,
                sampleProducts: verifiedProducts.slice(0, 3).map((p: any) => String(p.name || '')),
                reasonFr: String(item.reasonFr || ''),
                reasonEn: String(item.reasonEn || ''),
                source: 'ai',
              });
            }
          }
        } catch {
          // Non-fatal: deterministic taxonomy suggestions are always returned
        }
      }

      res.json({
        analyzedProductsCount: activeProducts.length,
        suggestions: mergedSuggestions,
        aiEnhanced,
        source,
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Inventory menu analysis failed.' });
    }
  });

  // Transactional Server-Side Checkout & Stock Reservation
  app.post('/api/checkout/create-order', async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    let verifiedUid: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length).trim());
        verifiedUid = decoded.uid;
      } catch {
        verifiedUid = null;
      }
    }

    const body = req.body || {};
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryMethod,
      promoCode,
      paymentMethod,
      items,
    } = body;

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !shippingAddress?.street ||
      !shippingAddress?.city ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({ error: 'Missing required checkout fields or cart items.' });
      return;
    }

    const providers = getProviderStatuses();
    const selectedProvider = providers.find((p) => p.id === paymentMethod);
    if (!selectedProvider) {
      res.status(400).json({ error: 'Unsupported payment method.' });
      return;
    }

    try {
      const orderId = `ord_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const orderNumber = `KJ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const paymentId = `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const idempotencyKey = `${orderId}_${paymentMethod}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const result = await adminDb.runTransaction(async (tx) => {
        let subtotalXof = 0;
        const verifiedItems: any[] = [];

        // 1. Verify variants and reserve inventory atomically
        for (const item of items) {
          const qty = Math.max(1, Math.round(Number(item.quantity || 1)));
          const varRef = adminDb.collection('variants').doc(String(item.variantId));
          const varSnap = await tx.get(varRef);
          if (!varSnap.exists) {
            throw new Error(`Variant ${item.variantId} not found.`);
          }
          const variant = varSnap.data() as any;
          const prodRef = adminDb.collection('products').doc(String(variant.productId));
          const prodSnap = await tx.get(prodRef);
          if (!prodSnap.exists) {
            throw new Error(`Product ${variant.productId} not found.`);
          }
          const product = prodSnap.data() as any;

          const available = (variant.stockQty || 0) - (variant.reservedQty || 0);
          if (!product.isPreorder && available < qty) {
            throw new Error(
              `Insufficient stock for ${product.name} (${variant.color} / ${variant.size}). Available: ${Math.max(0, available)}`
            );
          }

          const unitPrice = Math.round(Number(variant.priceXof || product.regularPriceXof || 0));
          subtotalXof += unitPrice * qty;

          verifiedItems.push({
            productId: variant.productId,
            variantId: varSnap.id,
            productName: product.name,
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            unitPriceXof: unitPrice,
            quantity: qty,
            imageUrl: Array.isArray(product.images) && product.images[0] ? product.images[0] : '',
          });

          if (!product.isPreorder) {
            tx.update(varRef, {
              reservedQty: (variant.reservedQty || 0) + qty,
              updatedAt: FieldValue.serverTimestamp(),
            });
          }

          const resId = `res_${orderId}_${varSnap.id}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
          tx.set(adminDb.collection('inventory_reservations').doc(resId), {
            variantId: varSnap.id,
            productId: variant.productId,
            orderId,
            qty,
            status: 'active',
            expiresAt,
            createdAt: FieldValue.serverTimestamp(),
          });

          const movId = `mov_${orderId}_${varSnap.id}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
          tx.set(adminDb.collection('inventory_movements').doc(movId), {
            variantId: varSnap.id,
            productId: variant.productId,
            sku: variant.sku,
            type: 'reservation',
            deltaQty: -qty,
            previousQty: available,
            newQty: Math.max(0, available - qty),
            reason: `Checkout reservation for ${orderNumber}`,
            referenceId: orderId,
            actorEmail: String(customerEmail),
            createdAt: FieldValue.serverTimestamp(),
          });
        }

        // 2. Shipping & Discount Calculation
        const cfgSnap = await tx.get(adminDb.collection('storefront_config').doc('main'));
        const cfg = cfgSnap.exists ? (cfgSnap.data() as any) : {};
        const freeThreshold = cfg.freeShippingThresholdXof ?? 75000;
        const standardFee = cfg.standardShippingXof ?? 3500;
        const expressFee = cfg.expressShippingXof ?? 7500;

        let discountXof = 0;
        let appliedPromo: string | null = null;
        if (promoCode && typeof promoCode === 'string') {
          const cleanCode = promoCode.trim().toUpperCase();
          const promoQuery = await adminDb
            .collection('promotions')
            .where('code', '==', cleanCode)
            .where('isActive', '==', true)
            .limit(1)
            .get();
          if (!promoQuery.empty) {
            const promoDoc = promoQuery.docs[0];
            const promo = promoDoc.data() as any;
            if (
              subtotalXof >= (promo.minOrderXof || 0) &&
              (promo.maxUses === 0 || (promo.usedCount || 0) < promo.maxUses)
            ) {
              appliedPromo = cleanCode;
              discountXof =
                promo.type === 'percentage'
                  ? Math.round((subtotalXof * promo.value) / 100)
                  : Math.min(subtotalXof, promo.value);
              tx.update(promoDoc.ref, {
                usedCount: (promo.usedCount || 0) + 1,
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          }
        }

        const discountedSubtotal = Math.max(0, subtotalXof - discountXof);
        const shippingFeeXof =
          deliveryMethod === 'express'
            ? expressFee
            : discountedSubtotal >= freeThreshold
              ? 0
              : standardFee;

        const totalXof = discountedSubtotal + shippingFeeXof;

        const orderDoc = {
          orderNumber,
          userId: verifiedUid,
          customerName: String(customerName).slice(0, 160),
          customerEmail: String(customerEmail).trim().toLowerCase().slice(0, 254),
          customerPhone: String(customerPhone).slice(0, 40),
          shippingAddress: {
            recipientName: String(shippingAddress.recipientName || customerName).slice(0, 160),
            phone: String(shippingAddress.phone || customerPhone).slice(0, 40),
            street: String(shippingAddress.street).slice(0, 240),
            city: String(shippingAddress.city).slice(0, 100),
            country: String(shippingAddress.country || 'Côte d\'Ivoire').slice(0, 100),
            notes: String(shippingAddress.notes || '').slice(0, 300),
          },
          deliveryMethod: deliveryMethod === 'express' ? 'Express Courier (24h)' : 'Standard Delivery',
          shippingFeeXof,
          promoCode: appliedPromo,
          discountXof,
          subtotalXof,
          totalXof,
          currency: 'XOF',
          paymentMethod,
          paymentStatus: selectedProvider.configured ? 'pending' : 'awaiting_verification',
          fulfillmentStatus: 'unfulfilled',
          items: verifiedItems,
          trackingNumber: null,
          notes: selectedProvider.configured
            ? 'Awaiting verified provider webhook confirmation.'
            : `Provider credentials missing (${selectedProvider.missingEnvVars.join(', ')}). Order stored in awaiting_verification state.`,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        tx.set(adminDb.collection('orders').doc(orderId), orderDoc);
        tx.set(adminDb.collection('payments').doc(paymentId), {
          orderId,
          orderNumber,
          userId: verifiedUid,
          provider: paymentMethod,
          amountXof: totalXof,
          currency: 'XOF',
          status: selectedProvider.configured ? 'pending' : 'awaiting_verification',
          providerReference: '',
          webhookVerified: false,
          idempotencyKey,
          missingConfiguration: selectedProvider.missingEnvVars,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          orderId,
          orderNumber,
          paymentId,
          subtotalXof,
          discountXof,
          shippingFeeXof,
          totalXof,
          currency: 'XOF',
          paymentStatus: orderDoc.paymentStatus,
          providerConfigured: selectedProvider.configured,
          missingEnvVars: selectedProvider.missingEnvVars,
          reservationExpiresAt: expiresAt,
        };
      });

      res.status(201).json(result);
    } catch (error: any) {
      const msg = String(error?.message || '');
      if (msg.includes('default credentials') || msg.includes('UNAUTHENTICATED')) {
        res.status(503).json({
          code: 'SERVER_ADC_UNAVAILABLE',
          error: 'Server Firestore service credentials are not attached in this preview environment.',
        });
        return;
      }
      res.status(400).json({
        error: msg || 'Unable to process checkout reservation.',
      });
    }
  });

  // Release Expired or Failed Inventory Reservations (Admin or Scheduler)
  app.post('/api/checkout/release-expired', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const nowIso = new Date().toISOString();
      const snap = await adminDb
        .collection('inventory_reservations')
        .where('status', '==', 'active')
        .get();

      let releasedCount = 0;
      for (const docSnap of snap.docs) {
        const resData = docSnap.data() as any;
        if (resData.expiresAt && resData.expiresAt < nowIso) {
          await adminDb.runTransaction(async (tx) => {
            const vRef = adminDb.collection('variants').doc(resData.variantId);
            const vSnap = await tx.get(vRef);
            if (vSnap.exists) {
              const vData = vSnap.data() as any;
              const nextReserved = Math.max(0, (vData.reservedQty || 0) - (resData.qty || 0));
              tx.update(vRef, {
                reservedQty: nextReserved,
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
            tx.update(docSnap.ref, { status: 'expired' });
            const oRef = adminDb.collection('orders').doc(resData.orderId);
            const oSnap = await tx.get(oRef);
            if (oSnap.exists && oSnap.data()?.paymentStatus === 'pending') {
              tx.update(oRef, {
                paymentStatus: 'failed',
                fulfillmentStatus: 'cancelled',
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          });
          releasedCount++;
        }
      }
      res.json({ releasedCount });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to release reservations' });
    }
  });

  // Verified Server-Side Payment Webhook Handler (HMAC + Idempotency)
  app.post('/api/payments/webhook/:provider', async (req: any, res: Response) => {
    const provider = String(req.params.provider || '').toLowerCase();
    const secret = getWebhookSecretForProvider(provider);

    if (!secret) {
      res.status(503).json({
        error: `Webhook secret is not configured for provider '${provider}'. Payment cannot be verified.`,
      });
      return;
    }

    const signatureHeader =
      (req.headers['x-kikijones-signature'] as string) ||
      (req.headers['x-mireza-signature'] as string) ||
      (req.headers['x-wave-signature'] as string) ||
      (req.headers['x-signature'] as string) ||
      '';

    if (!signatureHeader || !verifyHmacSignature(req.rawBody || '', signatureHeader, secret)) {
      res.status(401).json({ error: 'Invalid webhook HMAC signature.' });
      return;
    }

    const { eventId, orderId, status, providerReference } = req.body || {};
    if (!eventId || !orderId || !status) {
      res.status(400).json({ error: 'Missing required eventId, orderId, or status.' });
      return;
    }

    const cleanEventId = String(eventId).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    const eventRef = adminDb.collection('payment_webhook_events').doc(cleanEventId);

    try {
      const result = await adminDb.runTransaction(async (tx) => {
        const existingEvent = await tx.get(eventRef);
        if (existingEvent.exists) {
          return { idempotentDuplicate: true };
        }

        const orderRef = adminDb.collection('orders').doc(String(orderId));
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists) {
          throw new Error('Order not found');
        }

        tx.set(eventRef, {
          provider,
          eventId: cleanEventId,
          signatureValid: true,
          orderId: String(orderId),
          processedAt: FieldValue.serverTimestamp(),
        });

        if (status === 'paid' || status === 'succeeded') {
          tx.update(orderRef, {
            paymentStatus: 'paid',
            fulfillmentStatus: 'processing',
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Consume active reservations and deduct physical stock
          const resSnap = await adminDb
            .collection('inventory_reservations')
            .where('orderId', '==', String(orderId))
            .where('status', '==', 'active')
            .get();

          for (const rDoc of resSnap.docs) {
            const r = rDoc.data() as any;
            const vRef = adminDb.collection('variants').doc(r.variantId);
            const vSnap = await tx.get(vRef);
            if (vSnap.exists) {
              const v = vSnap.data() as any;
              const prevStock = v.stockQty || 0;
              const nextStock = Math.max(0, prevStock - (r.qty || 0));
              const nextReserved = Math.max(0, (v.reservedQty || 0) - (r.qty || 0));
              tx.update(vRef, {
                stockQty: nextStock,
                reservedQty: nextReserved,
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
            tx.update(rDoc.ref, { status: 'consumed' });
          }
        } else if (status === 'failed' || status === 'cancelled') {
          tx.update(orderRef, {
            paymentStatus: 'failed',
            fulfillmentStatus: 'cancelled',
            updatedAt: FieldValue.serverTimestamp(),
          });

          const resSnap = await adminDb
            .collection('inventory_reservations')
            .where('orderId', '==', String(orderId))
            .where('status', '==', 'active')
            .get();

          for (const rDoc of resSnap.docs) {
            const r = rDoc.data() as any;
            const vRef = adminDb.collection('variants').doc(r.variantId);
            const vSnap = await tx.get(vRef);
            if (vSnap.exists) {
              const v = vSnap.data() as any;
              tx.update(vRef, {
                reservedQty: Math.max(0, (v.reservedQty || 0) - (r.qty || 0)),
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
            tx.update(rDoc.ref, { status: 'released' });
          }
        }

        const payQuery = await adminDb
          .collection('payments')
          .where('orderId', '==', String(orderId))
          .limit(1)
          .get();
        if (!payQuery.empty) {
          tx.update(payQuery.docs[0].ref, {
            status: status === 'paid' || status === 'succeeded' ? 'paid' : 'failed',
            webhookVerified: true,
            providerReference: String(providerReference || ''),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        return { idempotentDuplicate: false, processedStatus: status };
      });

      res.json({ received: true, ...result });
    } catch (error: any) {
      res.status(400).json({ error: error?.message || 'Webhook processing error' });
    }
  });

  // Frontend serving (Vite dev middleware in dev, static dist in prod)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        setHeaders(res, filePath) {
          if (
            filePath.endsWith('index.html') ||
            filePath.endsWith('sw.js') ||
            filePath.endsWith('registerSW.js') ||
            filePath.endsWith('manifest.webmanifest')
          ) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KIKI JONES server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
