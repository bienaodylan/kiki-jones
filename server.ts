import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

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
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KIKI JONES server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
