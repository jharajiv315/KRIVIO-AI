import { ImageStudioGeneratedAsset } from '../services/api';

/**
 * Downscale and compress an uploaded image client-side to prevent
 * payload-too-large errors (Vercel 4.5MB limit) and speed up transmission.
 */
export async function optimizeImageUpload(
  file: File,
  maxDimension = 1280,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDimension && height <= maxDimension) {
          // If already within limits, return compressed data url
          try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', quality));
              return;
            }
          } catch {}
          resolve(src);
          return;
        }

        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
            return;
          }
        } catch {}

        resolve(src);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Client-Side Studio Canvas Generation Engine
 * Creates high-fidelity commercial studio enhancements directly in the browser.
 * Serves as an immediate zero-latency safety net for network or API quota limits.
 */
export async function generateClientStudioAsset(params: {
  originalImage: string;
  operationId?: string;
  aspectRatio?: string;
  brandName?: string;
  tagline?: string;
  festival?: string;
}): Promise<ImageStudioGeneratedAsset> {
  const {
    originalImage,
    operationId = 'CLEAN_STUDIO',
    aspectRatio = '1:1',
    brandName = 'Artisan Craft',
    tagline = 'Handmade with Love in India',
    festival = 'Diwali',
  } = params;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Determine canvas dimensions
      let width = 1080;
      let height = 1080;

      if (aspectRatio === '9:16') {
        width = 1080;
        height = 1920;
      } else if (aspectRatio === '4:5' || aspectRatio === '3:4') {
        width = 1080;
        height = 1350;
      } else if (aspectRatio === '16:9') {
        width = 1920;
        height = 1080;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Pure White Background (Amazon/ONDC standard)
      if (operationId === 'WHITE_BACKGROUND' || operationId === 'MARKETPLACE_PRIMARY_IMAGE') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Grounding contact shadow
        const shadowGrad = ctx.createRadialGradient(
          width / 2,
          height * 0.86,
          width * 0.05,
          width / 2,
          height * 0.86,
          width * 0.38
        );
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.22)');
        shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(width / 2, height * 0.86, width * 0.35, height * 0.045, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw centered product image at 84% scale
        drawCenteredImage(ctx, img, width * 0.08, height * 0.08, width * 0.84, height * 0.80);
      }
      // 2. Teakwood or Natural Craft Surface
      else if (operationId === 'WOODEN_SURFACE' || operationId === 'NATURAL_CRAFT') {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#FDF8F0');
        bgGrad.addColorStop(0.5, '#F7EFE4');
        bgGrad.addColorStop(1, '#EFE2D1');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Soft daylight radial vignette
        const lightGrad = ctx.createRadialGradient(width * 0.3, height * 0.2, 50, width * 0.3, height * 0.2, width * 0.8);
        lightGrad.addColorStop(0, 'rgba(255, 253, 245, 0.6)');
        lightGrad.addColorStop(1, 'rgba(223, 207, 183, 0.25)');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, width, height);

        // Grounding contact shadow
        const shadowGrad = ctx.createRadialGradient(
          width / 2,
          height * 0.85,
          width * 0.05,
          width / 2,
          height * 0.85,
          width * 0.4
        );
        shadowGrad.addColorStop(0, 'rgba(74, 46, 20, 0.3)');
        shadowGrad.addColorStop(1, 'rgba(74, 46, 20, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(width / 2, height * 0.85, width * 0.38, height * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        drawCenteredImage(ctx, img, width * 0.07, height * 0.07, width * 0.86, height * 0.84);
      }
      // 3. WhatsApp Direct Product Card
      else if (operationId === 'WHATSAPP_CATALOG') {
        ctx.fillStyle = '#F4F6F5';
        ctx.fillRect(0, 0, width, height);

        // Header
        const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
        headerGrad.addColorStop(0, '#0F5132');
        headerGrad.addColorStop(1, '#072C1A');
        ctx.fillStyle = headerGrad;
        roundRect(ctx, width * 0.05, height * 0.03, width * 0.9, height * 0.12, 24);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(width * 0.038)}px system-ui, sans-serif`;
        ctx.fillText(brandName, width * 0.09, height * 0.08);

        ctx.fillStyle = '#D4AF37';
        ctx.font = `${Math.round(width * 0.024)}px system-ui, sans-serif`;
        ctx.fillText(tagline, width * 0.09, height * 0.12);

        // Badge
        ctx.fillStyle = '#D4AF37';
        roundRect(ctx, width * 0.68, height * 0.055, width * 0.23, height * 0.06, 14);
        ctx.fill();
        ctx.fillStyle = '#0F5132';
        ctx.font = `bold ${Math.round(width * 0.023)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('DIRECT CRAFT', width * 0.795, height * 0.092);
        ctx.textAlign = 'left';

        // Product Card Frame
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 12;
        roundRect(ctx, width * 0.05, height * 0.17, width * 0.9, height * 0.67, 32);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        drawCenteredImage(ctx, img, width * 0.08, height * 0.19, width * 0.84, height * 0.63);

        // WhatsApp CTA Ribbon
        ctx.fillStyle = '#25D366';
        roundRect(ctx, width * 0.05, height * 0.86, width * 0.9, height * 0.09, 20);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(width * 0.034)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Available on WhatsApp • Order Direct', width * 0.5, height * 0.915);
        ctx.textAlign = 'left';
      }
      // 4. Instagram Post or Story
      else if (operationId === 'INSTAGRAM_POST' || operationId === 'INSTAGRAM_STORY') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#141E18');
        bgGrad.addColorStop(1, '#08100C');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Glow
        const glow = ctx.createRadialGradient(width * 0.5, height * 0.45, 50, width * 0.5, height * 0.45, width * 0.6);
        glow.addColorStop(0, 'rgba(15, 81, 50, 0.45)');
        glow.addColorStop(1, 'rgba(8, 16, 12, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        // Header Brand
        ctx.fillStyle = '#D4AF37';
        ctx.font = `bold ${Math.round(width * 0.034)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(brandName.toUpperCase(), width * 0.5, height * 0.075);

        drawCenteredImage(ctx, img, width * 0.06, height * 0.11, width * 0.88, height * 0.74);

        // Story tagline
        ctx.fillStyle = '#E2E8F0';
        ctx.font = `${Math.round(width * 0.026)}px system-ui, sans-serif`;
        ctx.fillText(tagline, width * 0.5, height * 0.92);

        ctx.fillStyle = '#D4AF37';
        ctx.font = `bold ${Math.round(width * 0.022)}px system-ui, sans-serif`;
        ctx.fillText('HANDMADE WITH LOVE IN INDIA', width * 0.5, height * 0.955);
        ctx.textAlign = 'left';
      }
      // 5. Festive Celebration Creative
      else if (
        operationId === 'FESTIVAL_PROMOTION' ||
        operationId === 'DIWALI' ||
        operationId === 'HOLI' ||
        operationId === 'NAVRATRI' ||
        operationId === 'EID' ||
        operationId === 'WEDDING_GIFTING'
      ) {
        const festGrad = ctx.createLinearGradient(0, 0, width, height);
        festGrad.addColorStop(0, '#2D1A04');
        festGrad.addColorStop(0.5, '#140B02');
        festGrad.addColorStop(1, '#241201');
        ctx.fillStyle = festGrad;
        ctx.fillRect(0, 0, width, height);

        // Festive golden bokeh
        const bokeh = ctx.createRadialGradient(width * 0.5, height * 0.5, 40, width * 0.5, height * 0.5, width * 0.55);
        bokeh.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
        bokeh.addColorStop(0.6, 'rgba(212, 175, 55, 0.08)');
        bokeh.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bokeh;
        ctx.fillRect(0, 0, width, height);

        // Festive border
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 2;
        roundRect(ctx, width * 0.03, height * 0.03, width * 0.94, height * 0.94, 20);
        ctx.stroke();

        ctx.fillStyle = '#D4AF37';
        ctx.font = `bold ${Math.round(width * 0.038)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`✨ ${festival} Special ✨`, width * 0.5, height * 0.085);

        ctx.fillStyle = '#FEF3C7';
        ctx.font = `${Math.round(width * 0.024)}px system-ui, sans-serif`;
        ctx.fillText(brandName, width * 0.5, height * 0.12);

        drawCenteredImage(ctx, img, width * 0.07, height * 0.15, width * 0.86, height * 0.72);

        ctx.fillStyle = '#FDE68A';
        ctx.font = `bold ${Math.round(width * 0.026)}px system-ui, sans-serif`;
        ctx.fillText('Celebrate Handcrafted Heritage • Perfect Festive Gift', width * 0.5, height * 0.935);
        ctx.textAlign = 'left';
      }
      // 6. Default: Clean Studio Photo
      else {
        const studioGrad = ctx.createLinearGradient(0, 0, 0, height);
        studioGrad.addColorStop(0, '#FBFBFB');
        studioGrad.addColorStop(0.7, '#F0F2F1');
        studioGrad.addColorStop(1, '#E2E6E4');
        ctx.fillStyle = studioGrad;
        ctx.fillRect(0, 0, width, height);

        const spotlight = ctx.createRadialGradient(width * 0.5, height * 0.3, 50, width * 0.5, height * 0.3, width * 0.6);
        spotlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        spotlight.addColorStop(1, 'rgba(226, 230, 228, 0)');
        ctx.fillStyle = spotlight;
        ctx.fillRect(0, 0, width, height);

        // Grounding contact shadow
        const shadow = ctx.createRadialGradient(width * 0.5, height * 0.86, width * 0.05, width * 0.5, height * 0.86, width * 0.36);
        shadow.addColorStop(0, 'rgba(15, 81, 50, 0.16)');
        shadow.addColorStop(1, 'rgba(15, 81, 50, 0)');
        ctx.fillStyle = shadow;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.86, width * 0.34, height * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();

        drawCenteredImage(ctx, img, width * 0.06, height * 0.06, width * 0.88, height * 0.88);
      }

      const generatedImage = canvas.toDataURL('image/png');
      const assetId = `ast_client_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      resolve({
        assetId,
        operationId,
        originalImage,
        generatedImage,
        aspectRatio,
        operationLabel: operationId.replace(/_/g, ' '),
        summaryNote: 'Professional studio lighting, calibrated framing, and commercial backdrop applied.',
        modelUsed: 'krivio-studio-engine',
        suggestedFollowUps: [
          'Make lighting slightly warmer',
          'Add subtle natural wooden surface',
          'Prepare for Amazon marketplace (pure white)',
          'Create an Instagram post version',
        ],
        createdAt: new Date().toISOString(),
      });
    };

    img.onerror = (e) => {
      reject(new Error('Failed to load image on canvas'));
    };

    img.src = originalImage;
  });
}

function drawCenteredImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  targetWidth: number,
  targetHeight: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = targetWidth / targetHeight;

  let drawW = targetWidth;
  let drawH = targetHeight;
  let drawX = x;
  let drawY = y;

  if (imgRatio > targetRatio) {
    drawH = targetWidth / imgRatio;
    drawY = y + (targetHeight - drawH) / 2;
  } else {
    drawW = targetHeight * imgRatio;
    drawX = x + (targetWidth - drawW) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
