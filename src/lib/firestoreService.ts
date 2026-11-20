import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Category,
  Product,
  ProductVariant,
  StorefrontConfig,
  Promotion,
  Order,
  InventoryMovement,
  AuditLog,
  ImportJob,
  CustomerAddress,
  UserProfile,
} from '../types/commerce';
import {
  ALL_SEED_PRODUCTS,
  DEFAULT_STOREFRONT_CONFIG,
  INITIAL_CATEGORIES,
  LEGACY_PLACEHOLDER_PRODUCT_IDS,
  OBSOLETE_CATEGORY_IDS,
} from './catalogDefaults';
import { sanitizeId } from './format';

export async function syncUserProfile(uid: string, email: string, fullName?: string) {
  const ref = doc(db, 'users', uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        email,
        fullName: fullName || '',
        phone: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}

export async function updateUserProfile(uid: string, data: { fullName: string; phone: string }) {
  try {
    await updateDoc(doc(db, 'users', uid), {
      fullName: data.fullName,
      phone: data.phone,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function getUserAddresses(uid: string): Promise<CustomerAddress[]> {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'addresses'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CustomerAddress, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/addresses`);
  }
}

export async function saveUserAddress(
  uid: string,
  address: Omit<CustomerAddress, 'id' | 'createdAt'>
) {
  const id = sanitizeId(`addr_${Date.now()}`);
  try {
    await setDoc(doc(db, 'users', uid, 'addresses', id), {
      ...address,
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${uid}/addresses/${id}`);
  }
}

export async function deleteUserAddress(uid: string, addressId: string) {
  try {
    await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/addresses/${addressId}`);
  }
}

export async function subscribeNewsletter(email: string, source = 'footer') {
  const id = sanitizeId(`sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
  try {
    await setDoc(doc(db, 'newsletter_subscribers', id), {
      email: email.trim().toLowerCase(),
      source,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `newsletter_subscribers/${id}`);
  }
}

export async function logAudit(
  actorEmail: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string
) {
  const id = sanitizeId(`aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
  try {
    await setDoc(doc(db, 'audit_logs', id), {
      actorEmail,
      action,
      entityType,
      entityId,
      details: details.slice(0, 490),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `audit_logs/${id}`);
  }
}

type BatchOp =
  | { type: 'set'; ref: ReturnType<typeof doc>; data: Record<string, any> }
  | { type: 'update'; ref: ReturnType<typeof doc>; data: Record<string, any> }
  | { type: 'delete'; ref: ReturnType<typeof doc> };

async function commitBatchOps(ops: BatchOp[]): Promise<void> {
  const CHUNK_SIZE = 350;
  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const chunk = ops.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const op of chunk) {
      if (op.type === 'set') {
        batch.set(op.ref, op.data);
      } else if (op.type === 'update') {
        batch.update(op.ref, op.data);
      } else {
        batch.delete(op.ref);
      }
    }
    await batch.commit();
  }
}

export async function seedInitialCatalogClient(actorEmail: string): Promise<{ seeded: boolean }> {
  try {
    const existingCats = await getDocs(collection(db, 'categories'));
    const existingProds = await getDocs(collection(db, 'products'));
    if (!existingCats.empty && !existingProds.empty) {
      return { seeded: false };
    }

    const ops: BatchOp[] = [];

    // 1. Storefront Config
    ops.push({
      type: 'set',
      ref: doc(db, 'storefront_config', 'main'),
      data: {
        ...DEFAULT_STOREFRONT_CONFIG,
        updatedAt: serverTimestamp(),
      },
    });

    // 2. Categories
    for (const cat of INITIAL_CATEGORIES) {
      ops.push({
        type: 'set',
        ref: doc(db, 'categories', cat.id),
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          imageUrl: cat.imageUrl,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      });
    }

    // 3. Products + Independent Variants + Initial Movement Log
    for (const p of ALL_SEED_PRODUCTS) {
      ops.push({
        type: 'set',
        ref: doc(db, 'products', p.id),
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          sku: p.sku,
          externalShopifyHandle: p.slug,
          images: p.images,
          runwayModelImageUrl: p.runwayModelImageUrl ?? null,
          colors: p.colors.map((c) => c.name),
          sizes: p.sizes,
          regularPriceXof: p.regularPriceXof,
          promoPriceXof: p.promoPriceXof,
          lowStockThreshold: p.lowStockThreshold,
          status: 'published',
          isNewDrop: p.isNewDrop,
          newDropOrder: p.newDropOrder,
          isFeatured: p.isFeatured,
          featuredOrder: p.featuredOrder,
          isPreorder: Boolean(p.isPreorder),
          preorderLimit: null,
          preorderEstimateDate: p.preorderEstimateDate ?? null,
          seoTitle: `${p.name} — KIKI JONES`,
          seoDescription: p.description.slice(0, 155),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      });

      for (const color of p.colors) {
        for (const size of p.sizes) {
          const key = `${color.name}-${size}`;
          const qty = p.stockMatrix[key] ?? 5;
          const variantId = sanitizeId(
            `var_${p.sku}_${color.name.replace(/\s+/g, '')}_${size.replace(/\s+/g, '')}`
          );
          const sku = `${p.sku}-${color.name.slice(0, 3).toUpperCase()}-${size
            .replace(/\s+/g, '')
            .toUpperCase()}`;

          ops.push({
            type: 'set',
            ref: doc(db, 'variants', variantId),
            data: {
              productId: p.id,
              sku,
              color: color.name,
              colorHex: color.hex,
              size,
              priceXof: p.promoPriceXof ?? p.regularPriceXof,
              compareAtPriceXof: p.promoPriceXof ? p.regularPriceXof : null,
              stockQty: qty,
              reservedQty: 0,
              lowStockThreshold: p.lowStockThreshold,
              weightGrams: 300,
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
          });

          const movId = sanitizeId(`mov_${variantId}_init`);
          ops.push({
            type: 'set',
            ref: doc(db, 'inventory_movements', movId),
            data: {
              variantId,
              productId: p.id,
              sku,
              type: 'addition',
              deltaQty: qty,
              previousQty: 0,
              newQty: qty,
              reason: 'Initial KIKI JONES collection allocation',
              referenceId: p.id,
              actorEmail,
              createdAt: serverTimestamp(),
            },
          });
        }
      }
    }

    // 4. Initial Launch Promotion Codes
    ops.push({
      type: 'set',
      ref: doc(db, 'promotions', 'promo_kikijones10'),
      data: {
        code: 'KIKIJONES10',
        type: 'percentage',
        value: 10,
        minOrderXof: 25000,
        maxUses: 500,
        usedCount: 0,
        startsAt: '2026-01-01',
        endsAt: '2027-12-31',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    });
    ops.push({
      type: 'set',
      ref: doc(db, 'promotions', 'promo_welcome5000'),
      data: {
        code: 'WELCOME5000',
        type: 'fixed',
        value: 5000,
        minOrderXof: 40000,
        maxUses: 300,
        usedCount: 0,
        startsAt: '2026-01-01',
        endsAt: '2027-12-31',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    });

    await commitBatchOps(ops);
    await logAudit(
      actorEmail,
      'SEED_INITIAL_CATALOG',
      'catalog',
      'full_launch_catalog',
      `Initialized 5 categories, ${ALL_SEED_PRODUCTS.length} products, variant matrix, and CMS defaults.`
    );
    return { seeded: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'catalog/seed');
  }
}

export async function ensureDefaultCategories(actorEmail: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    const existingById = new Map(snap.docs.map((d) => [d.id, d.data()]));
    const batch = writeBatch(db);
    let changed = false;

    for (const cat of INITIAL_CATEGORIES) {
      const existingDoc = existingById.get(cat.id);
      if (!existingDoc) {
        batch.set(doc(db, 'categories', cat.id), {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          imageUrl: cat.imageUrl,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        changed = true;
      } else if (
        existingDoc.name !== cat.name ||
        existingDoc.slug !== cat.slug ||
        existingDoc.imageUrl !== cat.imageUrl ||
        existingDoc.sortOrder !== cat.sortOrder
      ) {
        batch.update(doc(db, 'categories', cat.id), {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          imageUrl: cat.imageUrl,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
          updatedAt: serverTimestamp(),
        });
        changed = true;
      }
    }

    for (const oldCatId of OBSOLETE_CATEGORY_IDS) {
      if (existingById.has(oldCatId)) {
        batch.delete(doc(db, 'categories', oldCatId));
        changed = true;
      }
    }

    if (changed) {
      await batch.commit();
      await logAudit(
        actorEmail,
        'SYNC_CATEGORIES',
        'categories',
        'default',
        'Synced KIKI JONES categories (Women, Men, Girls, Boys, Accessories).'
      );
    }
  } catch {
    // non-fatal background sync
  }
}

export async function ensureFullSampleCatalog(actorEmail: string): Promise<{ addedProducts: number }> {
  try {
    await ensureDefaultCategories(actorEmail);
    const prodSnap = await getDocs(collection(db, 'products'));
    const existingProdIds = new Set(prodSnap.docs.map((d) => d.id));

    const missing = ALL_SEED_PRODUCTS.filter((p) => !existingProdIds.has(p.id));
    const hasObsoleteProducts = LEGACY_PLACEHOLDER_PRODUCT_IDS.some((id) => existingProdIds.has(id));
    if (missing.length === 0 && !hasObsoleteProducts) {
      return { addedProducts: 0 };
    }

    const ops: BatchOp[] = [];
    const needsCatalogRefresh =
      hasObsoleteProducts ||
      missing.some(
        (m) =>
          m.id === 'prod_fn_w_01' ||
          m.id === 'prod_fn_m_01' ||
          m.id === 'prod_fn_g_01' ||
          m.id === 'prod_fn_b_01'
      );

    if (needsCatalogRefresh) {
      ops.push({
        type: 'set',
        ref: doc(db, 'storefront_config', 'main'),
        data: {
          ...DEFAULT_STOREFRONT_CONFIG,
          updatedAt: serverTimestamp(),
        },
      });

      // Remove legacy generic/obsolete products & their variants
      for (const oldId of LEGACY_PLACEHOLDER_PRODUCT_IDS) {
        if (existingProdIds.has(oldId)) {
          ops.push({ type: 'delete', ref: doc(db, 'products', oldId) });
          const oldVars = await getDocs(
            query(collection(db, 'variants'), where('productId', '==', oldId))
          );
          oldVars.docs.forEach((vd) => ops.push({ type: 'delete', ref: vd.ref }));
        }
      }

      // Update existing seeded products safely without touching createdAt
      for (const seed of ALL_SEED_PRODUCTS) {
        if (existingProdIds.has(seed.id)) {
          ops.push({
            type: 'update',
            ref: doc(db, 'products', seed.id),
            data: {
              name: seed.name,
              description: seed.description,
              categoryName: seed.categoryName,
              isNewDrop: seed.isNewDrop,
              newDropOrder: seed.newDropOrder,
              isFeatured: seed.isFeatured,
              featuredOrder: seed.featuredOrder,
              isPreorder: Boolean(seed.isPreorder),
              preorderEstimateDate: seed.preorderEstimateDate ?? null,
              images: seed.images,
              runwayModelImageUrl: seed.runwayModelImageUrl ?? null,
              updatedAt: serverTimestamp(),
            },
          });
        }
      }
    }

    for (const p of missing) {
      ops.push({
        type: 'set',
        ref: doc(db, 'products', p.id),
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          sku: p.sku,
          externalShopifyHandle: p.slug,
          images: p.images,
          runwayModelImageUrl: p.runwayModelImageUrl ?? null,
          colors: p.colors.map((c) => c.name),
          sizes: p.sizes,
          regularPriceXof: p.regularPriceXof,
          promoPriceXof: p.promoPriceXof,
          lowStockThreshold: p.lowStockThreshold,
          status: 'published',
          isNewDrop: p.isNewDrop,
          newDropOrder: p.newDropOrder,
          isFeatured: p.isFeatured,
          featuredOrder: p.featuredOrder,
          isPreorder: Boolean(p.isPreorder),
          preorderLimit: null,
          preorderEstimateDate: p.preorderEstimateDate ?? null,
          seoTitle: `${p.name} — KIKI JONES`,
          seoDescription: p.description.slice(0, 155),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      });

      for (const color of p.colors) {
        for (const size of p.sizes) {
          const key = `${color.name}-${size}`;
          const qty = p.stockMatrix[key] ?? (p.isPreorder ? 0 : 5);
          const variantId = sanitizeId(
            `var_${p.sku}_${color.name.replace(/\s+/g, '')}_${size.replace(/\s+/g, '')}`
          );
          const sku = `${p.sku}-${color.name.slice(0, 3).toUpperCase()}-${size
            .replace(/\s+/g, '')
            .toUpperCase()}`;

          ops.push({
            type: 'set',
            ref: doc(db, 'variants', variantId),
            data: {
              productId: p.id,
              sku,
              color: color.name,
              colorHex: color.hex,
              size,
              priceXof: p.promoPriceXof ?? p.regularPriceXof,
              compareAtPriceXof: p.promoPriceXof ? p.regularPriceXof : null,
              stockQty: qty,
              reservedQty: 0,
              lowStockThreshold: p.lowStockThreshold,
              weightGrams: 300,
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
          });

          const movId = sanitizeId(`mov_${variantId}_init`);
          ops.push({
            type: 'set',
            ref: doc(db, 'inventory_movements', movId),
            data: {
              variantId,
              productId: p.id,
              sku,
              type: 'addition',
              deltaQty: qty,
              previousQty: 0,
              newQty: qty,
              reason: 'Catalog collection allocation',
              referenceId: p.id,
              actorEmail,
              createdAt: serverTimestamp(),
            },
          });
        }
      }
    }

    await commitBatchOps(ops);
    await logAudit(
      actorEmail,
      'SYNC_SAMPLE_CATALOG',
      'catalog',
      'kikijones_catalog_sync',
      `Synced ${missing.length} KIKI JONES catalog items and updated storefront defaults.`
    );
    return { addedProducts: missing.length };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'catalog/sample_sync');
  }
}

const CLIENT_ONLY_PRODUCT_KEYS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'audience',
  'subCategory',
  'collectionSlugs',
  'styleTags',
  'isBestSeller',
  'isTrending',
  'materialDetails',
]);

export async function saveProductAndVariants(
  productId: string | null,
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  variantsInput: Omit<ProductVariant, 'createdAt' | 'updatedAt'>[],
  actorEmail: string
): Promise<string> {
  const id = productId || sanitizeId(`prod_${productData.slug}_${Date.now().toString().slice(-5)}`);
  try {
    const prodRef = doc(db, 'products', id);
    const existingSnap = await getDoc(prodRef);

    const cleanProductData: Record<string, any> = {};
    for (const [k, v] of Object.entries(productData)) {
      if (v !== undefined && !CLIENT_ONLY_PRODUCT_KEYS.has(k)) {
        cleanProductData[k] = v;
      }
    }

    const batch = writeBatch(db);
    if (existingSnap.exists()) {
      batch.update(prodRef, {
        ...cleanProductData,
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.set(prodRef, {
        ...cleanProductData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const v of variantsInput) {
      const varRef = doc(db, 'variants', v.id);
      const varSnap = await getDoc(varRef);
      if (varSnap.exists()) {
        const prev = varSnap.data() as ProductVariant;
        batch.update(varRef, {
          productId: id,
          sku: v.sku,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          priceXof: v.priceXof,
          compareAtPriceXof: v.compareAtPriceXof ?? null,
          stockQty: v.stockQty,
          reservedQty: v.reservedQty ?? prev.reservedQty ?? 0,
          lowStockThreshold: v.lowStockThreshold,
          weightGrams: v.weightGrams ?? 250,
          isActive: v.isActive,
          updatedAt: serverTimestamp(),
        });
        if (prev.stockQty !== v.stockQty) {
          const movId = sanitizeId(`mov_${v.id}_${Date.now()}`);
          batch.set(doc(db, 'inventory_movements', movId), {
            variantId: v.id,
            productId: id,
            sku: v.sku,
            type: 'correction',
            deltaQty: v.stockQty - prev.stockQty,
            previousQty: prev.stockQty,
            newQty: v.stockQty,
            reason: 'Updated via Product Editor',
            referenceId: id,
            actorEmail,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        batch.set(varRef, {
          productId: id,
          sku: v.sku,
          color: v.color,
          colorHex: v.colorHex,
          size: v.size,
          priceXof: v.priceXof,
          compareAtPriceXof: v.compareAtPriceXof ?? null,
          stockQty: v.stockQty,
          reservedQty: 0,
          lowStockThreshold: v.lowStockThreshold,
          weightGrams: v.weightGrams ?? 250,
          isActive: v.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        const movId = sanitizeId(`mov_${v.id}_${Date.now()}`);
        batch.set(doc(db, 'inventory_movements', movId), {
          variantId: v.id,
          productId: id,
          sku: v.sku,
          type: 'addition',
          deltaQty: v.stockQty,
          previousQty: 0,
          newQty: v.stockQty,
          reason: 'Initial variant creation',
          referenceId: id,
          actorEmail,
          createdAt: serverTimestamp(),
        });
      }
    }

    await batch.commit();
    await logAudit(
      actorEmail,
      existingSnap.exists() ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
      'product',
      id,
      `${productData.name} (${variantsInput.length} variants)`
    );
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
  }
}

export async function adjustVariantStock(
  variant: ProductVariant,
  type: 'addition' | 'reduction' | 'correction',
  amount: number,
  reason: string,
  actorEmail: string
) {
  try {
    await runTransaction(db, async (tx) => {
      const varRef = doc(db, 'variants', variant.id);
      const snap = await tx.get(varRef);
      if (!snap.exists()) throw new Error('Variant not found');
      const current = snap.data() as ProductVariant;
      const previousQty = current.stockQty;
      let newQty = previousQty;
      if (type === 'addition') newQty = previousQty + Math.abs(amount);
      else if (type === 'reduction') newQty = Math.max(0, previousQty - Math.abs(amount));
      else newQty = Math.max(0, amount);

      const deltaQty = newQty - previousQty;
      tx.update(varRef, {
        stockQty: newQty,
        updatedAt: serverTimestamp(),
      });

      const movId = sanitizeId(`mov_${variant.id}_${Date.now()}`);
      tx.set(doc(db, 'inventory_movements', movId), {
        variantId: variant.id,
        productId: variant.productId,
        sku: variant.sku,
        type,
        deltaQty,
        previousQty,
        newQty,
        reason: reason || `Manual ${type}`,
        referenceId: variant.id,
        actorEmail,
        createdAt: serverTimestamp(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `variants/${variant.id}`);
  }
}

export async function saveStorefrontConfig(config: StorefrontConfig, actorEmail: string) {
  try {
    const cleanPayload: Record<string, any> = {};
    for (const [k, v] of Object.entries(config)) {
      if (v !== undefined) cleanPayload[k] = v;
    }
    cleanPayload.cmsVersion = 9;
    cleanPayload.standardShippingXof = Math.max(0, Math.round(Number(config.standardShippingXof) || 0));
    cleanPayload.expressShippingXof = Math.max(0, Math.round(Number(config.expressShippingXof) || 0));
    cleanPayload.freeShippingThresholdXof = Math.max(0, Math.round(Number(config.freeShippingThresholdXof) || 0));
    cleanPayload.updatedAt = serverTimestamp();

    await setDoc(doc(db, 'storefront_config', 'main'), cleanPayload);
    await logAudit(actorEmail, 'UPDATE_STOREFRONT_CMS', 'storefront_config', 'main', 'Updated storefront layout & CMS');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'storefront_config/main');
  }
}

export async function saveCategory(
  categoryId: string | null,
  data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
  actorEmail: string
) {
  const id = categoryId || sanitizeId(`cat_${data.slug}`);
  try {
    const ref = doc(db, 'categories', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } else {
      await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    await logAudit(actorEmail, snap.exists() ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'category', id, data.name);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
  }
}

export async function deleteCategoryAdmin(categoryId: string, actorEmail: string) {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
    await logAudit(actorEmail, 'DELETE_CATEGORY', 'category', categoryId, 'Deleted collection/category');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
  }
}

export async function assignProductsToCategory(
  productIds: string[],
  categoryId: string,
  categoryName: string,
  actorEmail: string
) {
  if (productIds.length === 0) return;
  try {
    const ops: BatchOp[] = productIds.map((pid) => ({
      type: 'update',
      ref: doc(db, 'products', pid),
      data: {
        categoryId,
        categoryName,
        updatedAt: serverTimestamp(),
      },
    }));
    await commitBatchOps(ops);
    await logAudit(
      actorEmail,
      'ASSIGN_COLLECTION_PRODUCTS',
      'category',
      categoryId,
      `Assigned ${productIds.length} products to ${categoryName}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `categories/${categoryId}`);
  }
}

export async function savePromotion(
  promoId: string | null,
  data: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>,
  actorEmail: string
) {
  const id = promoId || sanitizeId(`promo_${data.code.toLowerCase()}`);
  try {
    const ref = doc(db, 'promotions', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } else {
      await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    await logAudit(actorEmail, snap.exists() ? 'UPDATE_PROMO' : 'CREATE_PROMO', 'promotion', id, data.code);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `promotions/${id}`);
  }
}

export async function deletePromotionAdmin(promoId: string, actorEmail: string) {
  try {
    await deleteDoc(doc(db, 'promotions', promoId));
    await logAudit(actorEmail, 'DELETE_PROMO', 'promotion', promoId, 'Deleted promotion code');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `promotions/${promoId}`);
  }
}

export async function validatePromoCode(code: string, subtotalXof: number): Promise<Promotion | null> {
  try {
    const q = query(
      collection(db, 'promotions'),
      where('code', '==', code.trim().toUpperCase()),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const promo = { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<Promotion, 'id'>) };
    const now = new Date().toISOString().slice(0, 10);
    if (promo.startsAt && now < promo.startsAt) return null;
    if (promo.endsAt && now > promo.endsAt) return null;
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) return null;
    if (subtotalXof < promo.minOrderXof) return null;
    return promo;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'promotions');
  }
}

export async function updateOrderAdmin(
  orderId: string,
  updates: Partial<Pick<Order, 'paymentStatus' | 'fulfillmentStatus' | 'trackingNumber' | 'notes'>>,
  actorEmail: string
) {
  try {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await logAudit(
      actorEmail,
      'UPDATE_ORDER',
      'order',
      orderId,
      `Updated status: ${JSON.stringify(updates)}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function recordRefundAdmin(
  orderId: string,
  amountXof: number,
  reason: string,
  actorEmail: string
) {
  const refundId = sanitizeId(`ref_${orderId}_${Date.now()}`);
  try {
    await setDoc(doc(db, 'refunds', refundId), {
      orderId,
      amountXof: Math.round(amountXof),
      reason,
      status: 'processed',
      createdBy: actorEmail,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'orders', orderId), {
      paymentStatus: 'refunded',
      updatedAt: serverTimestamp(),
    });
    await logAudit(actorEmail, 'ISSUE_REFUND', 'order', orderId, `${amountXof} XOF — ${reason}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `refunds/${refundId}`);
  }
}

export async function recordImportJob(job: Omit<ImportJob, 'id' | 'createdAt'>) {
  const id = sanitizeId(`imp_${Date.now()}`);
  try {
    await setDoc(doc(db, 'import_jobs', id), {
      ...job,
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `import_jobs/${id}`);
  }
}

export async function deleteProductAdmin(productId: string, actorEmail: string) {
  try {
    const varSnap = await getDocs(query(collection(db, 'variants'), where('productId', '==', productId)));
    const batch = writeBatch(db);
    batch.delete(doc(db, 'products', productId));
    varSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    await logAudit(actorEmail, 'DELETE_PRODUCT', 'product', productId, 'Deleted product and its variants');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}

export async function bulkUpdateProductStatus(
  productIds: string[],
  status: 'published' | 'draft' | 'archived',
  actorEmail: string
) {
  if (productIds.length === 0) return;
  try {
    const ops: BatchOp[] = productIds.map((pid) => ({
      type: 'update',
      ref: doc(db, 'products', pid),
      data: { status, updatedAt: serverTimestamp() },
    }));
    await commitBatchOps(ops);
    await logAudit(actorEmail, 'BULK_STATUS_PRODUCTS', 'product', 'bulk', `Set ${productIds.length} products to ${status}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'products/bulk_status');
  }
}

export async function bulkDeleteProducts(productIds: string[], actorEmail: string) {
  for (const pid of productIds) {
    await deleteProductAdmin(pid, actorEmail);
  }
}

export async function updateProductFieldsAdmin(
  productId: string,
  updates: Record<string, any>,
  actorEmail: string
) {
  try {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined && !CLIENT_ONLY_PRODUCT_KEYS.has(k)) {
        clean[k] = v;
      }
    }
    await updateDoc(doc(db, 'products', productId), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
    await logAudit(actorEmail, 'UPDATE_PRODUCT', 'product', productId, `Updated fields: ${Object.keys(clean).join(', ')}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
  }
}

export async function bulkUpdateProductPrices(
  productsToUpdate: { id: string; regularPriceXof: number; promoPriceXof: number | null }[],
  actorEmail: string
) {
  if (productsToUpdate.length === 0) return;
  try {
    const ops: BatchOp[] = [];
    for (const item of productsToUpdate) {
      ops.push({
        type: 'update',
        ref: doc(db, 'products', item.id),
        data: {
          regularPriceXof: Math.max(0, Math.round(item.regularPriceXof)),
          promoPriceXof: item.promoPriceXof !== null ? Math.max(0, Math.round(item.promoPriceXof)) : null,
          updatedAt: serverTimestamp(),
        },
      });
    }
    await commitBatchOps(ops);
    await logAudit(
      actorEmail,
      'BULK_UPDATE_PRICES',
      'product',
      'bulk',
      `Updated prices for ${productsToUpdate.length} products`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'products/bulk_prices');
  }
}
