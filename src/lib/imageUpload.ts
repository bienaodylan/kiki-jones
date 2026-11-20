import { auth } from './firebase';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });
}

function optimizeImageDataUrl(rawDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1800;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawDataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Export as high-quality JPEG so WhatsApp photos / PNGs stay crisp and lightweight
      const out = canvas.toDataURL('image/jpeg', 0.88);
      resolve(out);
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

export async function uploadAdminImage(file: File): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Please sign in as administrator before uploading images.');
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const optimizedDataUrl = await optimizeImageDataUrl(rawDataUrl);

  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      dataUrl: optimizedDataUrl,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || 'Image upload failed.');
  }
  return String(payload.url);
}
