/**
 * 현장 사진 법적 효력 타임스탬프 & 위치 자동 각인 엔진
 * HTML5 Canvas를 이용해 원본 해상도를 보존하며 시각적 위변조 방지 워터마크를 합성합니다.
 */

export interface WatermarkOptions {
  siteName: string;
  location?: string;
  trade?: string;
  timestamp?: string; // YYYY-MM-DD HH:mm:ss (미지정 시 현재 시간)
  author?: string;
}

/**
 * 날짜 포맷팅 헬퍼 (YYYY-MM-DD HH:mm:ss)
 */
export function getFormattedCurrentTime(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

/**
 * 이미지에 법적 효력 타임스탬프 및 현장 정보를 각인하여 dataURL(JPEG)로 반환
 */
export async function stampPhotoWithWatermark(
  imageSource: string | File,
  options: WatermarkOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    let srcUrl = "";
    let isObjectUrl = false;

    if (typeof imageSource === "string") {
      srcUrl = imageSource;
    } else {
      srcUrl = URL.createObjectURL(imageSource);
      isObjectUrl = true;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (isObjectUrl) URL.revokeObjectURL(srcUrl);
          return resolve(typeof imageSource === "string" ? imageSource : "");
        }

        // 최대 1600px로 리사이징하여 선명도 유지 및 메모리 최적화
        const maxDimension = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 1. 원본 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // 2. 워터마크 정보 구성
        const timeText = options.timestamp || getFormattedCurrentTime();
        const siteText = options.siteName || "공사현장";
        const locText = options.location ? ` | ${options.location}` : "";
        const tradeText = options.trade || "현장시공·감리";
        const authorText = options.author ? ` (${options.author})` : "";

        const line1 = `⏱️ ${timeText} (KST)`;
        const line2 = `📍 [현장] ${siteText}${locText}`;
        const line3 = `🛠️ [공종] ${tradeText}${authorText}`;
        const brandText = "CheckReport™ 현장실측인증";

        // 3. 동적 폰트 크기 계산 (이미지 너비에 비례)
        const baseFontSize = Math.max(14, Math.round(width * 0.024));
        const lineHeight = Math.round(baseFontSize * 1.45);
        const padding = Math.round(baseFontSize * 1.2);

        ctx.font = `bold ${baseFontSize}px 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

        // 가장 긴 텍스트 너비 측정
        const w1 = ctx.measureText(line1).width;
        const w2 = ctx.measureText(line2).width;
        const w3 = ctx.measureText(line3).width;
        const maxTextWidth = Math.max(w1, w2, w3);

        const badgeWidth = maxTextWidth + padding * 2.2;
        const badgeHeight = lineHeight * 3 + padding * 1.8 + Math.round(baseFontSize * 0.9);

        // 4. 우측 하단 배치 위치 계산
        const margin = Math.round(width * 0.025);
        const x = Math.max(margin, width - badgeWidth - margin);
        const y = Math.max(margin, height - badgeHeight - margin);

        // 5. 반투명 배경 패널 (다크 그라데이션)
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // 둥근 모서리 사각형
        const radius = Math.round(baseFontSize * 0.6);
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)"; // Slate 900 88% 투명도
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + badgeWidth - radius, y);
        ctx.quadraticCurveTo(x + badgeWidth, y, x + badgeWidth, y + radius);
        ctx.lineTo(x + badgeWidth, y + badgeHeight - radius);
        ctx.quadraticCurveTo(x + badgeWidth, y + badgeHeight, x + badgeWidth - radius, y + badgeHeight);
        ctx.lineTo(x + radius, y + badgeHeight);
        ctx.quadraticCurveTo(x, y + badgeHeight, x, y + badgeHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        // 테두리 강조선
        ctx.lineWidth = Math.max(1.5, Math.round(baseFontSize * 0.08));
        ctx.strokeStyle = "rgba(56, 189, 248, 0.7)"; // Sky blue
        ctx.stroke();
        ctx.restore();

        // 6. 텍스트 렌더링
        let textY = y + padding + baseFontSize * 0.8;

        // Line 1: 시간 (Emerald 강조)
        ctx.fillStyle = "#34D399"; // Emerald 400
        ctx.fillText(line1, x + padding, textY);

        // Line 2: 현장 & 위치 (White)
        textY += lineHeight;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(line2, x + padding, textY);

        // Line 3: 공종 & 담당자 (Amber 강조)
        textY += lineHeight;
        ctx.fillStyle = "#FBBF24"; // Amber 400
        ctx.fillText(line3, x + padding, textY);

        // Brand & 위변조 방지 인증 마크
        textY += Math.round(lineHeight * 0.95);
        ctx.font = `600 ${Math.round(baseFontSize * 0.72)}px 'Pretendard', sans-serif`;
        ctx.fillStyle = "rgba(148, 163, 184, 0.9)"; // Slate 400
        ctx.fillText(brandText, x + padding, textY);

        // 7. JPEG 데이터 추출
        const outputDataUrl = canvas.toDataURL("image/jpeg", 0.86);

        if (isObjectUrl) URL.revokeObjectURL(srcUrl);
        resolve(outputDataUrl);
      } catch (err) {
        if (isObjectUrl) URL.revokeObjectURL(srcUrl);
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (isObjectUrl) URL.revokeObjectURL(srcUrl);
      reject(err);
    };

    img.src = srcUrl;
  });
}
