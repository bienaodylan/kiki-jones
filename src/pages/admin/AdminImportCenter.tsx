import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Upload, Download, CheckCircle2, AlertTriangle, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Category, ImportJob, Product, ProductVariant } from '../../types/commerce';
import { formatXOF, getColorHex, sanitizeId, slugify, formatTimestamp } from '../../lib/format';
import { recordImportJob, logAudit } from '../../lib/firestoreService';
import { useLanguage } from '../../context/LanguageContext';

interface AdminImportCenterProps {
  products: Product[];
  variants: ProductVariant[];
  categories: Category[];
  importJobs: ImportJob[];
  actorEmail: string;
  onToast: (msg: string, tone?: 'default' | 'error' | 'success') => void;
}

type ImportFormat = 'shopify' | 'mireza';
type ImportMode = 'create_only' | 'update_only' | 'upsert' | 'skip_existing';

interface ParsedVariantRow {
  sku: string;
  color: string;
  size: string;
  priceXof: number;
  compareAtPriceXof: number | null;
  incomingStock: number;
  currentStock: number | null;
  weightGrams: number;
  existingVariantId: string | null;
}

interface ParsedProductGroup {
  key: string;
  handle: string;
  title: string;
  description: string;
  categoryName: string;
  published: boolean;
  images: string[];
  variants: ParsedVariantRow[];
  matchedProductId: string | null;
  action: 'create' | 'update' | 'skip';
  warnings: string[];
}

interface RowError {
  rowNumber: number;
  identifier: string;
  message: string;
}

const KIKIJONES_TEMPLATE_HEADERS = [
  'Handle',
  'Title',
  'Description',
  'Category',
  'Published',
  'Color',
  'Size',
  'SKU',
  'Price XOF',
  'Compare At Price XOF',
  'Stock Qty',
  'Weight Grams',
  'Image Src',
];

export function AdminImportCenter({
  products,
  variants,
  categories,
  importJobs,
  actorEmail,
  onToast,
}: AdminImportCenterProps) {
  const { tr } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [filename, setFilename] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<ImportFormat>('shopify');
  const [importMode, setImportMode] = useState<ImportMode>('upsert');
  const [colMap, setColMap] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [report, setReport] = useState<{
    created: number;
    updated: number;
    skipped: number;
    errors: RowError[];
  } | null>(null);

  const downloadBrandTemplate = () => {
    const sample = [
      KIKIJONES_TEMPLATE_HEADERS.join(','),
      'sculpted-rib-tank,"Sculpted Rib Tank","Double-layered modal rib tank.",Women,true,White,S,KJ-TNK-WHT-S,22000,,12,180,/assets/fashionnova/sierra-kaftan-maxi-dress__0.jpg',
      'sculpted-rib-tank,"Sculpted Rib Tank","Double-layered modal rib tank.",Women,true,Black,M,KJ-TNK-BLK-M,22000,,8,180,',
    ].join('\n');
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kikijones_product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleShopify = () => {
    const csv = [
      'Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Variant SKU,Variant Price,Variant Compare At Price,Variant Inventory Qty,Image Src,Image Position,Variant Grams',
      'minimal-poplin-shirt,"Minimal Poplin Shirt","<p>Crisp organic cotton poplin shirt.</p>",KIKI JONES,Women,Shirts,"New In,Essentials",TRUE,Color,White,Size,S,KJ-SHR-WH-S,32000,38000,10,/assets/fashionnova/sierra-kaftan-maxi-dress__0.jpg,1,240',
      'minimal-poplin-shirt,,,,,,,TRUE,Color,White,Size,M,KJ-SHR-WH-M,32000,38000,6,,,240',
      'minimal-poplin-shirt,,,,,,,TRUE,Color,Black,Size,S,KJ-SHR-BK-S,32000,38000,8,,,240',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopify_sample_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onToast('Please upload a valid .csv file.', 'error');
      return;
    }
    setFilename(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        if (headers.length === 0 || results.data.length === 0) {
          onToast('CSV file contains no headers or rows.', 'error');
          return;
        }
        setRawHeaders(headers);
        setRawRows(results.data);

        const isShopify =
          headers.includes('Handle') &&
          (headers.includes('Variant SKU') || headers.includes('Option1 Value'));
        setDetectedFormat(isShopify ? 'shopify' : 'mireza');

        // Auto-map columns
        const findCol = (candidates: string[]) =>
          headers.find((h) => candidates.some((c) => h.toLowerCase() === c.toLowerCase())) || '';

        setColMap({
          handle: findCol(['Handle', 'Slug', 'handle']),
          title: findCol(['Title', 'Name', 'Product Name']),
          body: findCol(['Body (HTML)', 'Description', 'Body']),
          category: findCol(['Product Category', 'Type', 'Category']),
          published: findCol(['Published', 'Status']),
          color: findCol(['Option1 Value', 'Color']),
          size: findCol(['Option2 Value', 'Size']),
          sku: findCol(['Variant SKU', 'SKU']),
          price: findCol(['Variant Price', 'Price XOF', 'Price']),
          compareAt: findCol(['Variant Compare At Price', 'Compare At Price XOF']),
          stock: findCol(['Variant Inventory Qty', 'Stock Qty', 'Inventory']),
          grams: findCol(['Variant Grams', 'Weight Grams']),
          image: findCol(['Image Src', 'Image URL', 'Image']),
        });

        setReport(null);
        setStep(2);
      },
      error: () => onToast('Failed to parse CSV file.', 'error'),
    });
  };

  // Reconstruct products & variants + inventory diffs
  const { groups, rowErrors } = useMemo(() => {
    if (rawRows.length === 0) return { groups: [], rowErrors: [] as RowError[] };

    const groupMap = new Map<string, ParsedProductGroup>();
    const errs: RowError[] = [];
    const seenSkus = new Set<string>();

    rawRows.forEach((row, index) => {
      const rowNum = index + 2;
      const handle = (row[colMap.handle] || '').trim();
      const title = (row[colMap.title] || '').trim();
      const sku = (row[colMap.sku] || '').trim();
      const rawPrice = (row[colMap.price] || '').replace(/[^0-9.]/g, '');
      const rawStock = (row[colMap.stock] || '').replace(/[^0-9-]/g, '');
      const img = (row[colMap.image] || '').trim();

      const key = handle || slugify(title);
      if (!key) {
        errs.push({ rowNumber: rowNum, identifier: sku || 'Unknown', message: 'Missing Handle/Title' });
        return;
      }

      if (!groupMap.has(key)) {
        const existingByHandle = products.find(
          (p) => p.externalShopifyHandle === key || p.slug === key
        );
        const existingVariant = sku ? variants.find((v) => v.sku === sku) : null;
        const matchedProd =
          existingByHandle ||
          (existingVariant ? products.find((p) => p.id === existingVariant.productId) : null) ||
          null;

        let action: 'create' | 'update' | 'skip' = 'create';
        if (matchedProd) {
          if (importMode === 'create_only' || importMode === 'skip_existing') action = 'skip';
          else action = 'update';
        } else {
          if (importMode === 'update_only') action = 'skip';
          else action = 'create';
        }

        const rawHtml = (row[colMap.body] || '').replace(/<[^>]+>/g, ' ').trim();
        const catRaw = (row[colMap.category] || 'Clothing').trim();
        const pubRaw = (row[colMap.published] || 'true').toLowerCase();

        groupMap.set(key, {
          key,
          handle: key,
          title: title || matchedProd?.name || key,
          description: rawHtml || matchedProd?.description || 'Contemporary KIKI JONES garment.',
          categoryName: catRaw || matchedProd?.categoryName || 'Clothing',
          published: pubRaw !== 'false' && pubRaw !== 'draft',
          images: img ? [img] : [],
          variants: [],
          matchedProductId: matchedProd?.id || null,
          action,
          warnings: [],
        });
      }

      const grp = groupMap.get(key)!;
      if (img && !grp.images.includes(img)) {
        grp.images.push(img);
      }

      if (sku || rawPrice || row[colMap.color] || row[colMap.size]) {
        const finalSku = sku || `${key.toUpperCase()}-${grp.variants.length + 1}`;
        if (seenSkus.has(finalSku)) {
          errs.push({
            rowNumber: rowNum,
            identifier: finalSku,
            message: `Duplicate SKU '${finalSku}' within CSV file`,
          });
          return;
        }
        seenSkus.add(finalSku);

        const priceNum = Math.round(Number(rawPrice || 0));
        if (!Number.isFinite(priceNum) || priceNum <= 0) {
          grp.warnings.push(`SKU ${finalSku} has 0 or missing price`);
        }

        const incomingStock = Math.max(0, Math.round(Number(rawStock || 0)));
        const existingVar = variants.find((v) => v.sku === finalSku) || null;

        grp.variants.push({
          sku: finalSku,
          color: (row[colMap.color] || 'Default').trim(),
          size: (row[colMap.size] || 'One Size').trim(),
          priceXof: priceNum > 0 ? priceNum : existingVar?.priceXof || 25000,
          compareAtPriceXof: row[colMap.compareAt]
            ? Math.round(Number(row[colMap.compareAt].replace(/[^0-9.]/g, '')))
            : null,
          incomingStock,
          currentStock: existingVar ? existingVar.stockQty : null,
          weightGrams: Math.round(Number(row[colMap.grams] || 250)) || 250,
          existingVariantId: existingVar?.id || null,
        });
      }
    });

    return { groups: Array.from(groupMap.values()), rowErrors: errs };
  }, [rawRows, colMap, products, variants, importMode]);

  const downloadErrorCsv = () => {
    if (!report || report.errors.length === 0) return;
    const csv = [
      'Row,Identifier,Error',
      ...report.errors.map((e) => `${e.rowNumber},"${e.identifier}","${e.message}"`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kikijones_import_errors_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const executeImport = async () => {
    setExecuting(true);
    let created = 0;
    let updated = 0;
    let skipped = 0;

    try {
      const batch = writeBatch(db);

      for (const grp of groups) {
        if (grp.action === 'skip') {
          skipped++;
          continue;
        }

        const matchedCat =
          categories.find((c) => c.name.toLowerCase() === grp.categoryName.toLowerCase()) ||
          categories[0];

        const prodId = grp.matchedProductId || sanitizeId(`prod_${grp.handle}_${Date.now().toString().slice(-4)}`);
        const existingProd = products.find((p) => p.id === prodId);

        const colors = Array.from(new Set(grp.variants.map((v) => v.color)));
        const sizes = Array.from(new Set(grp.variants.map((v) => v.size)));
        const basePrice = grp.variants[0]?.priceXof || existingProd?.regularPriceXof || 25000;

        const prodRef = doc(db, 'products', prodId);
        if (existingProd) {
          batch.update(prodRef, {
            name: grp.title,
            description: grp.description,
            categoryId: matchedCat?.id || existingProd.categoryId,
            categoryName: matchedCat?.name || grp.categoryName,
            externalShopifyHandle: grp.handle,
            images: grp.images.length > 0 ? grp.images : existingProd.images,
            colors: colors.length > 0 ? colors : existingProd.colors,
            sizes: sizes.length > 0 ? sizes : existingProd.sizes,
            regularPriceXof: basePrice,
            status: grp.published ? 'published' : 'draft',
            updatedAt: serverTimestamp(),
          });
          updated++;
        } else {
          batch.set(prodRef, {
            name: grp.title,
            slug: slugify(grp.handle || grp.title),
            description: grp.description,
            categoryId: matchedCat?.id || 'cat_set',
            categoryName: matchedCat?.name || grp.categoryName,
            sku: grp.variants[0]?.sku || grp.handle.toUpperCase(),
            externalShopifyHandle: grp.handle,
            images: grp.images,
            colors,
            sizes,
            regularPriceXof: basePrice,
            promoPriceXof: null,
            lowStockThreshold: 5,
            status: grp.published ? 'published' : 'draft',
            isNewDrop: false,
            newDropOrder: 99,
            isFeatured: false,
            featuredOrder: 99,
            isPreorder: false,
            preorderLimit: null,
            preorderEstimateDate: null,
            seoTitle: `${grp.title} — KIKI JONES`,
            seoDescription: grp.description.slice(0, 155),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          created++;
        }

        for (const v of grp.variants) {
          const varId = v.existingVariantId || sanitizeId(`var_${v.sku}`);
          const varRef = doc(db, 'variants', varId);
          if (v.existingVariantId) {
            batch.update(varRef, {
              productId: prodId,
              color: v.color,
              colorHex: getColorHex(v.color),
              size: v.size,
              priceXof: v.priceXof,
              compareAtPriceXof: v.compareAtPriceXof,
              stockQty: v.incomingStock,
              weightGrams: v.weightGrams,
              updatedAt: serverTimestamp(),
            });
            if (v.currentStock !== v.incomingStock) {
              const movId = sanitizeId(`mov_imp_${varId}_${Date.now()}`);
              batch.set(doc(db, 'inventory_movements', movId), {
                variantId: varId,
                productId: prodId,
                sku: v.sku,
                type: 'import',
                deltaQty: v.incomingStock - (v.currentStock || 0),
                previousQty: v.currentStock || 0,
                newQty: v.incomingStock,
                reason: `CSV Import (${filename})`,
                referenceId: prodId,
                actorEmail,
                createdAt: serverTimestamp(),
              });
            }
          } else {
            batch.set(varRef, {
              productId: prodId,
              sku: v.sku,
              color: v.color,
              colorHex: getColorHex(v.color),
              size: v.size,
              priceXof: v.priceXof,
              compareAtPriceXof: v.compareAtPriceXof,
              stockQty: v.incomingStock,
              reservedQty: 0,
              lowStockThreshold: 5,
              weightGrams: v.weightGrams,
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            const movId = sanitizeId(`mov_imp_${varId}_${Date.now()}`);
            batch.set(doc(db, 'inventory_movements', movId), {
              variantId: varId,
              productId: prodId,
              sku: v.sku,
              type: 'import',
              deltaQty: v.incomingStock,
              previousQty: 0,
              newQty: v.incomingStock,
              reason: `CSV Import (${filename})`,
              referenceId: prodId,
              actorEmail,
              createdAt: serverTimestamp(),
            });
          }
        }
      }

      await batch.commit();
      await recordImportJob({
        filename,
        format: detectedFormat,
        mode: importMode,
        totalRows: rawRows.length,
        createdCount: created,
        updatedCount: updated,
        skippedCount: skipped,
        errorCount: rowErrors.length,
        actorEmail,
      });
      await logAudit(
        actorEmail,
        'PRODUCT_CSV_IMPORT',
        'import',
        filename,
        `Created ${created}, Updated ${updated}, Skipped ${skipped}`
      );

      setReport({ created, updated, skipped, errors: rowErrors });
      setStep(4);
      onToast(`Import completed: ${created} created, ${updated} updated.`, 'success');
    } catch (err: any) {
      onToast(err?.message || 'CSV import failed.', 'error');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-black">
            {tr('Centre d’import CSV', 'CSV Product Import')}
          </h3>
          <p className="text-xs text-black/55 mt-0.5">
            {tr(
              'Import Shopify CSV ou modèle KIKI JONES avec regroupement automatique des variantes et aperçu des stocks.',
              'Shopify CSV & KIKI JONES template ingestion with variant reconstruction and stock diff preview.'
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadBrandTemplate}
            className="px-3.5 py-2 border border-[#E8E8E8] bg-white text-xs font-medium inline-flex items-center gap-1.5 hover:border-black cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{tr('Modèle KIKI JONES CSV', 'KIKI JONES CSV Template')}</span>
          </button>
          <button
            type="button"
            onClick={downloadSampleShopify}
            className="px-3.5 py-2 border border-[#E8E8E8] bg-white text-xs font-medium inline-flex items-center gap-1.5 hover:border-black cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{tr('Exemple Shopify CSV', 'Sample Shopify CSV')}</span>
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pb-2">
        {[
          { num: 1, label: tr('1. Fichier CSV', '1. Upload CSV') },
          { num: 2, label: tr('2. Colonnes', '2. Mapping') },
          { num: 3, label: tr('3. Aperçu', '3. Preview') },
          { num: 4, label: tr('4. Rapport', '4. Report') },
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2 px-3 border ${
              step === s.num
                ? 'border-black bg-black text-white font-medium'
                : 'border-[#E8E8E8] bg-white text-black/55'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <label className="block border border-dashed border-black/30 bg-[#FAFAFA] p-12 text-center cursor-pointer hover:border-black transition-colors">
          <Upload className="w-7 h-7 mx-auto text-black/55 mb-3" />
          <p className="text-sm font-semibold text-black">
            {tr('Déposez un export Shopify ou un fichier CSV KIKI JONES', 'Drop Shopify Export or KIKI JONES CSV')}
          </p>
          <p className="text-xs text-black/55 mt-1">
            {tr('Détection automatique du format, regroupement des variantes et correspondance SKU.', 'Automatic format detection, multi-row variant grouping, and SKU matching.')}
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </label>
      )}

      {step === 2 && (
        <div className="bg-white p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div>
              <p className="text-xs font-bold text-black">{filename}</p>
              <p className="text-xs font-light text-black/60">
                {rawRows.length} rows detected &middot; Format:{' '}
                <span className="uppercase font-bold text-black">{detectedFormat}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold uppercase tracking-[0.14em] text-black/60">Import Mode:</span>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as ImportMode)}
                className="border border-black/25 px-3 py-2 bg-white"
              >
                <option value="upsert">Create new &amp; update matching</option>
                <option value="create_only">Create new products only</option>
                <option value="update_only">Update matching products only</option>
                <option value="skip_existing">Skip existing products</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { key: 'handle', label: 'Handle / Slug' },
              { key: 'title', label: 'Product Title' },
              { key: 'category', label: 'Category / Type' },
              { key: 'sku', label: 'Variant SKU' },
              { key: 'color', label: 'Option 1 (Color)' },
              { key: 'size', label: 'Option 2 (Size)' },
              { key: 'price', label: 'Variant Price (XOF)' },
              { key: 'stock', label: 'Variant Inventory Qty' },
              { key: 'image', label: 'Image Src URL' },
            ].map((field) => (
              <label key={field.key} className="block space-y-1">
                <span className="font-bold uppercase tracking-[0.12em] text-black/60">{field.label}</span>
                <select
                  value={colMap[field.key] || ''}
                  onChange={(e) => setColMap({ ...colMap, [field.key]: e.target.value })}
                  className="w-full border border-black/25 px-3 py-2 bg-white"
                >
                  <option value="">-- Unmapped --</option>
                  {rawHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 border border-black/25 text-xs font-bold uppercase tracking-[0.14em] cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Preview Products &amp; Stock Diffs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {rowErrors.length > 0 && (
            <div className="border border-black bg-black/[0.03] p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-black">
                <AlertTriangle className="w-4 h-4 text-black" />
                <span>{rowErrors.length} Row Validation Errors Detected (will be skipped)</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 font-light text-black/80">
                {rowErrors.slice(0, 5).map((e, i) => (
                  <li key={i}>
                    Row {e.rowNumber} ({e.identifier}): {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border border-black/15 bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-editorial text-2xl text-black">
                Reconstructed Products ({groups.length})
              </h3>
              <p className="text-xs font-light text-black/60">
                Review inventory differences before confirming database write. Absent products are never deleted.
              </p>
            </div>

            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.key} className="p-4 bg-[#F7F7F7] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-black">{g.title}</span>
                      <span className="text-xs font-light text-black/60 ml-3">
                        {g.categoryName} &middot; {g.images.length} images &middot; {g.variants.length} variants
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                        g.action === 'create'
                          ? 'border border-black bg-white text-black'
                          : g.action === 'update'
                            ? 'bg-black text-white'
                            : 'bg-black/10 text-black/50'
                      }`}
                    >
                      {g.action}
                    </span>
                  </div>

                  {g.warnings.length > 0 && (
                    <p className="text-[11px] font-light text-black/70">
                      Warnings: {g.warnings.join('; ')}
                    </p>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[10px] font-bold uppercase tracking-[0.14em] text-black/60 bg-black/[0.03]">
                          <th className="py-1.5 pr-3 pl-2">SKU</th>
                          <th className="py-1.5 pr-3">Variant</th>
                          <th className="py-1.5 pr-3">Price</th>
                          <th className="py-1.5 text-right pr-2">Stock Diff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.variants.map((v) => {
                          const diff =
                            v.currentStock !== null ? v.incomingStock - v.currentStock : null;
                          return (
                            <tr key={v.sku}>
                              <td className="py-1.5 pr-3 pl-2 font-bold">{v.sku}</td>
                              <td className="py-1.5 pr-3 font-light">
                                {v.color} / {v.size}
                              </td>
                              <td className="py-1.5 pr-3 tabular-nums">{formatXOF(v.priceXof)}</td>
                              <td className="py-1.5 text-right tabular-nums">
                                {v.currentStock === null ? (
                                  <span>New ({v.incomingStock})</span>
                                ) : (
                                  <span>
                                    {v.currentStock} &rarr; {v.incomingStock} (
                                    {diff! >= 0 ? `+${diff}` : diff})
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-black/25 text-xs font-bold uppercase tracking-[0.14em] cursor-pointer"
              >
                Back to Mapping
              </button>
              <button
                type="button"
                disabled={executing}
                onClick={executeImport}
                className="px-7 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.18em] cursor-pointer disabled:opacity-50"
              >
                {executing ? 'Executing Database Import...' : 'Confirm & Commit Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && report && (
        <div className="border border-black/15 bg-white p-8 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-black" />
            <div>
              <h3 className="font-editorial text-2xl text-black">Import Complete</h3>
              <p className="text-xs font-light text-black/60">{filename}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="border border-black/15 p-4">
              <span className="text-black/60 font-bold uppercase tracking-wider">Created</span>
              <p className="text-2xl font-bold tabular-nums mt-1">{report.created}</p>
            </div>
            <div className="border border-black/15 p-4">
              <span className="text-black/60 font-bold uppercase tracking-wider">Updated</span>
              <p className="text-2xl font-bold tabular-nums mt-1">{report.updated}</p>
            </div>
            <div className="border border-black/15 p-4">
              <span className="text-black/60 font-bold uppercase tracking-wider">Skipped</span>
              <p className="text-2xl font-bold tabular-nums mt-1">{report.skipped}</p>
            </div>
            <div className="border border-black/15 p-4">
              <span className="text-black/60 font-bold uppercase tracking-wider">Row Errors</span>
              <p className="text-2xl font-bold tabular-nums mt-1">{report.errors.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {report.errors.length > 0 && (
              <button
                type="button"
                onClick={downloadErrorCsv}
                className="px-5 py-2.5 border border-black text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Error CSV</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setRawRows([]);
                setReport(null);
              }}
              className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-[0.16em] cursor-pointer"
            >
              Run Another Import
            </button>
          </div>
        </div>
      )}

      {/* Persistent Import History */}
      <div className="bg-white border border-[#E8E8E8] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-black">{tr('Historique des imports', 'Import history')}</h3>
        {importJobs.length === 0 ? (
          <p className="text-xs text-black/55">{tr('Aucun import CSV enregistré pour le moment.', 'No CSV import jobs recorded yet.')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-medium text-black/45 border-b border-[#E8E8E8]">
                  <th className="py-2 pr-4">{tr('Fichier', 'File')}</th>
                  <th className="py-2 pr-4">{tr('Format', 'Format')}</th>
                  <th className="py-2 pr-4">{tr('Mode', 'Mode')}</th>
                  <th className="py-2 pr-4 text-right">{tr('Créés / MAJ / Erreurs', 'Created / Updated / Errors')}</th>
                  <th className="py-2 text-right">{tr('Date', 'Date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {importJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="py-2.5 pr-4 font-medium text-black">{job.filename}</td>
                    <td className="py-2.5 pr-4 uppercase text-black/65">{job.format}</td>
                    <td className="py-2.5 pr-4 text-black/65">{job.mode}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {job.createdCount} / {job.updatedCount} / {job.errorCount}
                    </td>
                    <td className="py-2.5 text-right text-black/50 tabular-nums">
                      {formatTimestamp(job.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
