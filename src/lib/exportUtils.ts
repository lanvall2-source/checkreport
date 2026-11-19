import type { InspectionSite } from "@/types";

declare global {
  interface Window {
    XLSX?: any;
    html2pdf?: any;
  }
}

/**
 * 안전한 파일명을 위해 특수문자 제거
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").trim() || "현장점검보고서";
}

/**
 * 날짜 포맷 (YYYYMMDD_HHmm)
 */
function getDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${hh}${min}`;
}

/**
 * 외부 스크립트 동적 로드 헬퍼
 */
function loadExternalScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve();
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * ============================================================================
 * 1. 엑셀 파일 (.xlsx) 원클릭 자동 생성 및 다운로드
 * ============================================================================
 */
export async function exportToExcel(site: InspectionSite): Promise<boolean> {
  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const filename = `${sanitizeFilename(site.siteName)}_점검보고서_${getDateString()}.xlsx`;

  try {
    // 1. SheetJS (XLSX) 라이브러리 동적 로드
    if (!window.XLSX) {
      await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
    }

    const XLSX = window.XLSX;
    if (!XLSX) throw new Error("XLSX library unavailable");

    // 2. 워크북 및 시트 데이터 구성
    const wb = XLSX.utils.book_new();

    // [시트 1: 점검결과보고서 메인]
    const sheetData: any[][] = [
      ["현장 안전 및 품질 점검 결과 보고서"],
      [],
      ["■ 현장 개요"],
      ["점검 현장명", site.siteName, "", "점검 일자", currentDate],
      ["현장 위치", site.address, "", "발주처 / 고객사", site.client],
      ["적용 점검표", site.templateTitle, "", "점검 책임자", `${site.managerName} (${site.managerPhone})`],
      [],
      ["■ 점검 통계 요약"],
      ["총 점검 항목", `${site.totalItems}건`, "합격 항목", `${site.completedItems}건`],
      ["지적(미조치) 항목", `${site.failedItems}건`, "점검 진행률", `${site.progressPercent}%`],
      [],
      ["■ 상세 점검 항목 및 현장 실사 결과"],
      [
        "No.",
        "구분(카테고리)",
        "점검 항목명",
        "관리 및 점검 기준",
        "판정 결과",
        "지적 위치",
        "조치 지시 사항",
        "사진 등록 현황",
      ],
    ];

    site.items.forEach((item, idx) => {
      let photoStatus = "미등록";
      if (item.photoAfter && item.photoBefore) {
        photoStatus = "조치전·후 (2장)";
      } else if (item.photoBefore) {
        photoStatus = "실사 등록 (1장)";
      }

      sheetData.push([
        idx + 1,
        item.category,
        item.title,
        item.standard,
        item.status === "pass" ? "적합 (합격)" : "부적합 (지적사항)",
        item.defectLocation || "-",
        item.actionNotes || "-",
        photoStatus,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 컬럼 너비 최적화 (가독성 극대화)
    ws["!cols"] = [
      { wch: 6 },  // No
      { wch: 16 }, // 구분
      { wch: 30 }, // 점검 항목명
      { wch: 36 }, // 관리 기준
      { wch: 18 }, // 판정 결과
      { wch: 22 }, // 지적 위치
      { wch: 34 }, // 조치 지시
      { wch: 18 }, // 사진 현황
    ];

    XLSX.utils.book_append_sheet(wb, ws, "점검결과총괄");

    // 파일 저장
    XLSX.writeFile(wb, filename);
    return true;
  } catch (err) {
    console.warn("XLSX generation failed, falling back to UTF-8 CSV:", err);

    // [Fallback] UTF-8 BOM CSV 생성 (엑셀에서 한글 깨짐 없이 즉시 열림)
    try {
      const csvRows = [
        `\uFEFF"현장 안전 및 품질 점검 결과 보고서 - ${site.siteName}"`,
        `"점검일자","${currentDate}","점검현장명","${site.siteName}"`,
        `"현장위치","${site.address}","발주처","${site.client}"`,
        `"점검책임자","${site.managerName} (${site.managerPhone})","적용점검표","${site.templateTitle}"`,
        `"총항목수","${site.totalItems}","합격","${site.completedItems}","지적","${site.failedItems}","진행률","${site.progressPercent}%"`,
        "",
        `"No.","구분","점검항목","관리기준","판정결과","지적위치","조치지시사항"`,
      ];

      site.items.forEach((item, idx) => {
        csvRows.push(
          `"${idx + 1}","${item.category}","${item.title.replace(/"/g, '""')}","${item.standard.replace(/"/g, '""')}","${
            item.status === "pass" ? "합격" : "지적"
          }","${(item.defectLocation || "-").replace(/"/g, '""')}","${(item.actionNotes || "-").replace(/"/g, '""')}"`
        );
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFilename(site.siteName)}_점검보고서_${getDateString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (csvErr) {
      console.error("CSV Fallback also failed:", csvErr);
      return false;
    }
  }
}

/**
 * ============================================================================
 * 2. 원클릭 PDF 직접 파일 다운로드 (.pdf)
 * ============================================================================
 */
export async function exportToPdf(site: InspectionSite, targetElementId?: string): Promise<boolean> {
  const filename = `${sanitizeFilename(site.siteName)}_현장점검보고서_${getDateString()}.pdf`;

  try {
    // 1. html2pdf 라이브러리 동적 로드
    if (!window.html2pdf) {
      await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");
    }

    const html2pdf = window.html2pdf;
    if (!html2pdf) throw new Error("html2pdf library unavailable");

    // 2. 렌더링할 타겟 엘리먼트 획득 또는 오프스크린 컨테이너 생성
    let element: HTMLElement | null = null;
    let isTemporary = false;

    if (targetElementId) {
      element = document.getElementById(targetElementId);
    }

    // 만약 타겟 엘리먼트가 없으면 인쇄용 풀 규격 HTML을 오프스크린에 빌드
    if (!element) {
      isTemporary = true;
      element = createPrintHtmlElement(site);
      document.body.appendChild(element);
    }

    const opt = {
      margin: [10, 8, 10, 8], // 상, 우, 하, 좌 (mm)
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2, // 2배 고해상도 렌더링
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(opt).from(element).save();

    if (isTemporary && element) {
      document.body.removeChild(element);
    }

    return true;
  } catch (err) {
    console.warn("Direct PDF generation failed, falling back to window print:", err);
    // [Fallback] 브라우저 기본 인쇄 모달을 통한 PDF 저장 유도
    printInspectionReport(site);
    return false;
  }
}

/**
 * PDF 생성을 위한 임시 오프스크린 리포트 엘리먼트 생성기
 */
function createPrintHtmlElement(site: InspectionSite): HTMLElement {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "#ffffff";
  container.style.color = "#0f172a";
  container.style.fontFamily = "Pretendard, -apple-system, sans-serif";
  container.style.padding = "24px";
  container.style.boxSizing = "border-box";

  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  container.innerHTML = `
    <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
      <div style="font-size: 10px; color: #64748b; font-weight: bold; margin-bottom: 4px;">[공문 및 감리 보고서 규격 / 체크리포트 정식 발급]</div>
      <h1 style="font-size: 20px; font-weight: 900; margin: 0; color: #0f172a;">현장 정기 점검 결과 및 사진 대지 보고서</h1>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px;">
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 6px 10px; background: #f8fafc; text-align: left; width: 110px;">점검 현장명</th>
        <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">${site.siteName}</td>
        <th style="border: 1px solid #cbd5e1; padding: 6px 10px; background: #f8fafc; text-align: left; width: 110px;">점검 일자</th>
        <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${currentDate}</td>
      </tr>
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 6px 10px; background: #f8fafc; text-align: left;">현장 위치</th>
        <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${site.address}</td>
        <th style="border: 1px solid #cbd5e1; padding: 6px 10px; background: #f8fafc; text-align: left;">발주처 / 고객사</th>
        <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${site.client}</td>
      </tr>
      <tr>
        <th style="border: 1px solid #cbd5e1; padding: 6px 10px; background: #f8fafc; text-align: left;">적용 점검표</th>
        <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${site.templateTitle}</td>
        <th style="border: 1px solid #cbd5e1; padding: 6px 10px; background: #f8fafc; text-align: left;">점검 책임자</th>
        <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${site.managerName} (${site.managerPhone})</td>
      </tr>
    </table>

    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; background: #f8fafc;">
        <div style="font-size: 16px; font-weight: 900; color: #0f172a;">${site.totalItems}건</div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold;">총 점검 항목</div>
      </div>
      <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; background: #f8fafc;">
        <div style="font-size: 16px; font-weight: 900; color: #16a34a;">${site.completedItems}건</div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold;">합격 항목</div>
      </div>
      <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; background: #f8fafc;">
        <div style="font-size: 16px; font-weight: 900; color: #dc2626;">${site.failedItems}건</div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold;">지적 항목</div>
      </div>
      <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; background: #f8fafc;">
        <div style="font-size: 16px; font-weight: 900; color: #2563eb;">${site.progressPercent}%</div>
        <div style="font-size: 10px; color: #64748b; font-weight: bold;">점검 진행률</div>
      </div>
    </div>

    <h3 style="font-size: 13px; font-weight: 800; border-left: 3px solid #2563eb; padding-left: 6px; margin: 12px 0 8px 0;">
      현장 실사 사진 대지
    </h3>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
      ${site.items
        .map(
          (item, idx) => `
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; font-size: 10px; page-break-inside: avoid;">
          ${
            item.photoAfter
              ? `
                <div style="display: flex; height: 140px;">
                  <div style="flex: 1; position: relative; border-right: 1px solid #cbd5e1;">
                    <img src="${item.photoBefore}" style="width: 100%; height: 100%; object-fit: cover;" alt="조치전" />
                    <span style="position: absolute; bottom: 3px; left: 3px; background: rgba(220,38,38,0.9); color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: bold;">조치 전</span>
                  </div>
                  <div style="flex: 1; position: relative;">
                    <img src="${item.photoAfter}" style="width: 100%; height: 100%; object-fit: cover;" alt="조치후" />
                    <span style="position: absolute; bottom: 3px; left: 3px; background: rgba(22,163,74,0.9); color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: bold;">조치 후</span>
                  </div>
                </div>
              `
              : item.photoBefore
              ? `<img src="${item.photoBefore}" style="width: 100%; height: 140px; object-fit: cover; display: block;" alt="점검사진" />`
              : `<div style="height: 140px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8;">사진 미등록</div>`
          }
          <div style="padding: 8px 10px; border-top: 1px solid #cbd5e1;">
            <div>
              <span style="display: inline-block; padding: 1px 5px; border-radius: 3px; font-weight: bold; font-size: 9px; background: ${
                item.status === "pass" ? "#dcfce7; color: #166534;" : "#fee2e2; color: #991b1b;"
              }">
                ${item.status === "pass" ? "적합 (합격)" : "부적합 (지적사항)"}
              </span>
              <span style="color: #64748b; font-weight: bold; margin-left: 4px;">No.${idx + 1} [${item.category}]</span>
            </div>
            <div style="font-weight: bold; margin-top: 4px; font-size: 11px;">${item.title}</div>
            <div style="color: #64748b; margin-top: 2px;">기준: ${item.standard}</div>
            ${item.defectLocation ? `<div style="color: #2563eb; margin-top: 2px; font-weight: bold;">위치: ${item.defectLocation}</div>` : ""}
            ${item.actionNotes ? `<div style="color: #dc2626; margin-top: 2px; font-weight: bold;">조치: ${item.actionNotes}</div>` : ""}
          </div>
        </div>
      `
        )
        .join("")}
    </div>

    <div style="margin-top: 20px; text-align: right; font-size: 10px; border-top: 1px solid #cbd5e1; padding-top: 12px;">
      <div>상기와 같이 현장 안전 및 품질 점검을 실시하고 사진 대지 보고서를 제출합니다.</div>
      <div style="margin-top: 6px; font-weight: bold;">점검 주체 : 체크리포트 통합 관제 시스템</div>
      <div style="display: inline-block; border: 1.5px solid #2563eb; color: #2563eb; padding: 4px 12px; border-radius: 4px; font-weight: bold; margin-top: 6px;">체크리포트 검토승인필</div>
    </div>
  `;

  return container;
}

/**
 * ============================================================================
 * 3. A4 인쇄창 호출 (기존 호환 유지)
 * ============================================================================
 */
export { printInspectionReport } from "@/components/ReportPrintModal";
