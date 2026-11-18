import React from "react";
import type { InspectionSite } from "@/types";

export function printInspectionReport(site: InspectionSite) {
  const printWindow = window.open("", "_blank", "width=850,height=1100");
  if (!printWindow) {
    window.print();
    return;
  }

  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>현장 안전 및 품질 점검 결과 보고서 - ${site.siteName}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
      <style>
        body { font-family: Pretendard, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
        .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
        .sub { font-size: 11px; color: #64748b; margin-bottom: 4px; }
        h1 { font-size: 22px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
        
        /* 메타 테이블 */
        table.meta { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
        table.meta th, table.meta td { border: 1px solid #cbd5e1; padding: 8px 12px; }
        table.meta th { background: #f8fafc; font-weight: 700; width: 120px; color: #334155; }
        
        /* 통계 요약 박스 */
        .summary-box { display: flex; gap: 12px; margin-bottom: 24px; }
        .summary-card { flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; background: #f8fafc; }
        .summary-num { font-size: 20px; font-weight: 900; color: #0f172a; }
        .summary-label { font-size: 11px; color: #64748b; font-weight: bold; margin-top: 2px; }

        /* 사진 대지 2단 그리드 */
        .photo-sheet { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; page-break-inside: avoid; }
        .photo-card { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #fff; font-size: 11px; }
        .photo-img { width: 100%; height: 180px; object-fit: cover; background: #e2e8f0; display: block; }
        .photo-desc { padding: 10px 12px; border-top: 1px solid #cbd5e1; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; margin-bottom: 4px; }
        .badge-pass { background: #dcfce7; color: #166534; }
        .badge-fail { background: #fee2e2; color: #991b1b; }
        
        .footer { margin-top: 40px; text-align: right; font-size: 12px; border-top: 1px solid #cbd5e1; padding-top: 16px; }
        .stamp { display: inline-block; border: 2px solid #2563eb; color: #2563eb; padding: 6px 16px; border-radius: 6px; font-weight: bold; margin-top: 8px; }

        @media print {
          body { padding: 0; }
          .photo-card { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="sub">[공문 및 감리 보고서 규격 / 체크리포트 클라우드 자동 생성]</div>
        <h1>현장 정기 점검 결과 및 사진 대지 보고서</h1>
      </div>

      <table class="meta">
        <tr>
          <th>점검 현장명</th>
          <td style="font-weight: bold;">${site.siteName}</td>
          <th>점검 일자</th>
          <td>${currentDate}</td>
        </tr>
        <tr>
          <th>현장 위치(주소)</th>
          <td>${site.address}</td>
          <th>발주처 / 고객사</th>
          <td>${site.client}</td>
        </tr>
        <tr>
          <th>적용 점검표</th>
          <td>${site.templateTitle}</td>
          <th>점검 책임자</th>
          <td>${site.managerName} (${site.managerPhone})</td>
        </tr>
      </table>

      <!-- 점검 결과 요약 -->
      <div class="summary-box">
        <div class="summary-card">
          <div class="summary-num">${site.totalItems}건</div>
          <div class="summary-label">총 점검 항목</div>
        </div>
        <div class="summary-card">
          <div class="summary-num" style="color: #16a34a;">${site.completedItems}건</div>
          <div class="summary-label">합격 항목</div>
        </div>
        <div class="summary-card">
          <div class="summary-num" style="color: #dc2626;">${site.failedItems}건</div>
          <div class="summary-label">미조치(지적) 항목</div>
        </div>
        <div class="summary-card">
          <div class="summary-num" style="color: #2563eb;">${site.progressPercent}%</div>
          <div class="summary-label">점검 진행률</div>
        </div>
      </div>

      <!-- 현장 사진 대지 -->
      <h3 style="font-size: 14px; font-weight: 800; border-left: 4px solid #2563eb; padding-left: 8px; margin: 20px 0 12px 0;">
        현장 실사 사진 대지 (A4 2단 표준 조판)
      </h3>

      <div class="photo-sheet">
        ${site.items
          .map(
            (item, index) => `
          <div class="photo-card">
            ${
              item.photoBefore
                ? `<img src="${item.photoBefore}" class="photo-img" alt="점검사진" />`
                : `<div class="photo-img" style="display:flex;align-items:center;justify-content:center;color:#94a3b8;">사진 미등록</div>`
            }
            <div class="photo-desc">
              <div>
                <span class="badge ${item.status === "pass" ? "badge-pass" : "badge-fail"}">
                  ${item.status === "pass" ? "적합 (합격)" : "부적합 (지적사항)"}
                </span>
                <span style="color:#64748b; font-weight:bold; margin-left:4px;">No.${index + 1} [${item.category}]</span>
              </div>
              <div style="font-weight:bold; margin-top:4px; font-size:12px;">${item.title}</div>
              <div style="color:#64748b; margin-top:2px;">기준: ${item.standard}</div>
              ${item.defectLocation ? `<div style="color:#2563eb; margin-top:4px; font-weight:bold;">위치: ${item.defectLocation}</div>` : ""}
              ${item.actionNotes ? `<div style="color:#dc2626; margin-top:2px; font-weight:bold;">조치 지시: ${item.actionNotes}</div>` : ""}
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="footer">
        <div>상기와 같이 현장 안전 및 품질 점검을 실시하고 사진 대지 보고서를 제출합니다.</div>
        <div style="margin-top: 10px; font-weight: bold;">점검 기관 : 체크리포트 클라우드 관제 시스템 (검증 완료)</div>
        <div class="stamp">체크리포트 검토승인필</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}