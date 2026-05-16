/**
 * react-easy-crop 의 onCropComplete 가 넘겨주는 픽셀 단위 crop 영역.
 */
export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * 원본 이미지를 주어진 crop 영역으로 잘라 JPEG Blob 으로 변환합니다.
 *
 * <p>{@code maxSize} 가 지정되면 가로/세로 중 긴 쪽을 이 값으로 맞춰 다운스케일.
 * 출력 비율은 crop 영역의 비율과 동일합니다.
 *
 * @param imageSrc 원본 이미지 URL (object URL 가능)
 * @param crop 잘라낼 픽셀 영역 (react-easy-crop 의 croppedAreaPixels)
 * @param maxSize 출력 이미지의 최대 변 크기 (px)
 */
export async function cropImageToBlob(
  imageSrc: string,
  crop: CropArea,
  maxSize: number,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const scale = Math.min(1, maxSize / Math.max(crop.width, crop.height));
  const outWidth = Math.round(crop.width * scale);
  const outHeight = Math.round(crop.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outWidth,
    outHeight,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      },
      'image/jpeg',
      0.92,
    );
  });
}
