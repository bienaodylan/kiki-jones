export interface DetectedColor {
  name: string;
  hex: string;
}

interface PaletteEntry {
  name: string;
  r: number;
  g: number;
  b: number;
}

const REFERENCE_PALETTE: PaletteEntry[] = [
  { name: 'Noir', r: 18, g: 18, b: 18 },
  { name: 'Charcoal', r: 58, g: 58, b: 62 },
  { name: 'Gris Perle', r: 158, g: 162, b: 168 },
  { name: 'Crème', r: 235, g: 226, b: 208 },
  { name: 'Rose Pastel', r: 233, g: 185, b: 200 },
  { name: 'Rose Fuchsia', r: 214, g: 64, b: 126 },
  { name: 'Rouge Corail', r: 214, g: 45, b: 58 },
  { name: 'Bordeaux', r: 118, g: 24, b: 42 },
  { name: 'Orange Soleil', r: 232, g: 106, b: 24 },
  { name: 'Jaune Soleil', r: 240, g: 204, b: 36 },
  { name: 'Or', r: 204, g: 162, b: 48 },
  { name: 'Vert Émeraude', r: 14, g: 107, b: 71 },
  { name: 'Vert Tropical', r: 34, g: 148, b: 78 },
  { name: 'Turquoise', r: 18, g: 168, b: 184 },
  { name: 'Bleu Caraïbe', r: 0, g: 149, b: 217 },
  { name: 'Bleu Royal', r: 24, g: 72, b: 168 },
  { name: 'Bleu Marine', r: 20, g: 38, b: 76 },
  { name: 'Violet', r: 106, g: 54, b: 148 },
  { name: 'Marron Chocolat', r: 108, g: 66, b: 42 },
];

const DETECTION_CACHE = new Map<string, DetectedColor[]>();

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function colorDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function closestFashionColorName(r: number, g: number, b: number): string {
  let bestName = 'Noir';
  let bestDist = Infinity;
  for (const entry of REFERENCE_PALETTE) {
    const dist = colorDistance({ r, g, b }, entry);
    if (dist < bestDist) {
      bestDist = dist;
      bestName = entry.name;
    }
  }
  return bestName;
}

/**
 * Automatically extracts up to `maxColors` dominant garment/product colors directly
 * from an image URL or data URL using HTML5 Canvas pixel clustering, ignoring studio
 * white/light-gray backdrops and transparent edges.
 */
export async function detectDominantColorsFromImageUrl(
  imageUrl: string,
  maxColors = 3
): Promise<DetectedColor[]> {
  const cleanUrl = (imageUrl || '').trim();
  if (!cleanUrl) return [];

  const cacheKey = `${cleanUrl}::${maxColors}`;
  const cached = DETECTION_CACHE.get(cacheKey);
  if (cached) return cached;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return [];
  }

  return new Promise((resolve) => {
    const img = new Image();
    if (!cleanUrl.startsWith('data:') && !cleanUrl.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const size = 96;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve([]);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        // Quantize non-background pixels into 24-step buckets
        const step = 24;
        const buckets = new Map<
          string,
          { rSum: number; gSum: number; bSum: number; count: number; satSum: number }
        >();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 140) continue;

          // Skip pure/near-white studio background & very bright neutral backdrop
          const maxCh = Math.max(r, g, b);
          const minCh = Math.min(r, g, b);
          const sat = maxCh === 0 ? 0 : (maxCh - minCh) / maxCh;
          if (r > 232 && g > 232 && b > 232) continue;
          if (minCh > 214 && sat < 0.08) continue;

          const qr = Math.round(r / step) * step;
          const qg = Math.round(g / step) * step;
          const qb = Math.round(b / step) * step;
          const key = `${qr},${qg},${qb}`;

          const existing = buckets.get(key);
          if (existing) {
            existing.rSum += r;
            existing.gSum += g;
            existing.bSum += b;
            existing.count += 1;
            existing.satSum += sat;
          } else {
            buckets.set(key, { rSum: r, gSum: g, bSum: b, count: 1, satSum: sat });
          }
        }

        if (buckets.size === 0) {
          resolve([{ name: 'Blanc / Écru', hex: '#F5F2EB' }]);
          return;
        }

        // Convert buckets to weighted clusters prioritizing true dominant garment area
        const totalValidPixels = Array.from(buckets.values()).reduce((s, b) => s + b.count, 0);
        const minClusterPixels = Math.max(8, Math.floor(totalValidPixels * 0.018));

        const rawClusters = Array.from(buckets.values())
          .filter((b) => b.count >= minClusterPixels || buckets.size <= 3)
          .map((b) => {
            const avgR = b.rSum / b.count;
            const avgG = b.gSum / b.count;
            const avgB = b.bSum / b.count;
            const avgSat = b.satSum / b.count;
            // Mild saturation preference prevents tiny speckles from beating dominant garment body color
            const score = b.count * (1 + avgSat * 0.45);
            return { r: avgR, g: avgG, b: avgB, count: b.count, score };
          })
          .sort((a, b) => b.score - a.score);

        // Merge perceptually close clusters and deduplicate semantic color names
        const selected: DetectedColor[] = [];
        const selectedRgb: { r: number; g: number; b: number }[] = [];
        const usedNames = new Set<string>();

        for (const c of rawClusters) {
          if (selected.length >= maxColors) break;
          const tooClose = selectedRgb.some((prev) => colorDistance(c, prev) < 52);
          if (tooClose) continue;

          const name = closestFashionColorName(c.r, c.g, c.b);
          if (usedNames.has(name)) continue;

          usedNames.add(name);
          selectedRgb.push({ r: c.r, g: c.g, b: c.b });
          selected.push({
            name,
            hex: rgbToHex(c.r, c.g, c.b),
          });
        }

        DETECTION_CACHE.set(cacheKey, selected);
        resolve(selected);
      } catch {
        resolve([]);
      }
    };

    img.onerror = () => resolve([]);
    img.src = cleanUrl;
  });
}

export interface ImageBackgroundAnalysis {
  hasTransparentOrWhiteBg: boolean;
  isTransparentCutout: boolean;
  isWhiteBackdrop: boolean;
}

const BG_ANALYSIS_CACHE = new Map<string, ImageBackgroundAnalysis>();

/**
 * Inspects perimeter & corner pixels on an offscreen canvas to distinguish:
 * - Transparent PNG cutouts (no background)
 * - Isolated pure-white studio backdrops
 * - Full-bleed photos / colored studio backgrounds
 */
export async function analyzeProductImageBackground(
  imageUrl: string
): Promise<ImageBackgroundAnalysis> {
  const cleanUrl = (imageUrl || '').trim();
  const fallback: ImageBackgroundAnalysis = {
    hasTransparentOrWhiteBg: false,
    isTransparentCutout: false,
    isWhiteBackdrop: false,
  };
  if (!cleanUrl) return fallback;

  const cached = BG_ANALYSIS_CACHE.get(cleanUrl);
  if (cached) return cached;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallback;
  }

  return new Promise((resolve) => {
    const img = new Image();
    if (!cleanUrl.startsWith('data:') && !cleanUrl.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(fallback);
          return;
        }

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let totalEdge = 0;
        let transparentEdge = 0;
        let pureWhiteEdge = 0;

        const inspectPixel = (x: number, y: number) => {
          const idx = (y * size + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          totalEdge += 1;
          if (a < 235) {
            transparentEdge += 1;
          } else {
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            if (r >= 240 && g >= 240 && b >= 240 && maxC - minC <= 14) {
              pureWhiteEdge += 1;
            }
          }
        };

        // Sample 2px deep around all 4 borders
        for (let i = 0; i < size; i++) {
          inspectPixel(i, 0);
          inspectPixel(i, 1);
          inspectPixel(i, size - 1);
          inspectPixel(i, size - 2);
          inspectPixel(0, i);
          inspectPixel(1, i);
          inspectPixel(size - 1, i);
          inspectPixel(size - 2, i);
        }

        // Check all 4 corners explicitly
        const cornerCoords = [
          [1, 1],
          [size - 2, 1],
          [1, size - 2],
          [size - 2, size - 2],
        ];
        let transparentCorners = 0;
        for (const [cx, cy] of cornerCoords) {
          const a = data[(cy * size + cx) * 4 + 3];
          if (a < 220) transparentCorners += 1;
        }

        const transparentRatio = totalEdge > 0 ? transparentEdge / totalEdge : 0;
        const opaqueEdge = Math.max(1, totalEdge - transparentEdge);
        const whiteRatio = pureWhiteEdge / opaqueEdge;

        const isTransparentCutout = transparentRatio >= 0.12 || transparentCorners >= 2;
        const isWhiteBackdrop = !isTransparentCutout && whiteRatio >= 0.78;
        const result: ImageBackgroundAnalysis = {
          hasTransparentOrWhiteBg: isTransparentCutout || isWhiteBackdrop,
          isTransparentCutout,
          isWhiteBackdrop,
        };

        BG_ANALYSIS_CACHE.set(cleanUrl, result);
        resolve(result);
      } catch {
        resolve(fallback);
      }
    };

    img.onerror = () => resolve(fallback);
    img.src = cleanUrl;
  });
}

