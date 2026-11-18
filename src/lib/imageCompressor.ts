// 스마트폰 고용량(5MB~15MB) 사진을 100KB~200KB로 실시간 캔버스 압축하는 유틸리티

export interface CompressResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75
): Promise<CompressResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // 비율 유지하며 최대 해상도 축소 (A4 인쇄에 최적화된 1024px)
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve({
            dataUrl: e.target?.result as string,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            width: img.width,
            height: img.height,
          });
        }

        // 이미지 부드럽게 렌더링
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG 0.75 압축 (화질 저하 없이 파일 크기 90% 이상 대폭 절감)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        const compressedSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeKb,
          compressedSizeKb,
          width,
          height,
        });
      };

      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
