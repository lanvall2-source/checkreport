import React, { useState } from "react";
import {
  Calendar,
  CloudSun,
  Users,
  HardHat,
  Truck,
  Package,
  ShieldCheck,
  Camera,
  FileSpreadsheet,
  Download,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Clock,
  MapPin,
  Check,
  Layers,
} from "lucide-react";
import type { InspectionSite, DailyWorkLog, TradeManpower, DailyWorkPhoto } from "@/types";
import { stampPhotoWithWatermark, getFormattedCurrentTime } from "@/lib/watermarkEngine";
import { exportDailyLogToExcel, exportDailyLogToPdf } from "@/lib/exportUtils";

interface DailyWorkLogTabProps {
  site: InspectionSite;
  onUpdateSite?: (updatedSite: InspectionSite) => void;
  onNotify?: (msg: string) => void;
}

const COMMON_TRADES = [
  "철근공",
  "형틀목수",
  "보통인부",
  "콘크리트공",
  "비계공",
  "전기공",
  "설비공",
  "조적·미장",
  "방수공",
  "도장공",
];

const WEATHER_OPTIONS = ["맑음 ☀️", "구름조금 ⛅", "흐림 ☁️", "비 🌧️", "눈 ❄️"];

export function DailyWorkLogTab({ site, onUpdateSite, onNotify }: DailyWorkLogTabProps) {
  // 현재 현장의 작업일보 목록 (없으면 기본값 생성)
  const currentLog: DailyWorkLog = site.dailyLogs && site.dailyLogs.length > 0
    ? site.dailyLogs[0]
    : {
        id: `LOG-${site.id}-${new Date().toISOString().split("T")[0]}`,
        siteId: site.id,
        siteName: site.siteName,
        reportDate: new Date().toISOString().split("T")[0],
        weather: "맑음",
        temperatureHigh: 14,
        temperatureLow: 3,
        author: site.managerName || "현장소장",
        todayWork: [
          "[골조공사] 지하 2층 매트기초 철근 배근 및 스페이서 점검 완료",
          "[전기공사] 지하 2층 바닥 슬라브 매립 전선관 배관 및 박스 고정",
          "[설비공사] 지하 2층 오배수 배관 인서트 슬리브 관통 작업",
          "[안전시설] 개구부 추락방지 덮개 고정 및 안전난간대 점검 (지하 1층)",
        ],
        tomorrowWork: [
          "[골조공사] 지하 2층 슬라브 레미콘 타설 (예정량 320m³ / 8-25-15)",
          "[품질관리] 레미콘 슬럼프, 공기량, 염화물 현장 품질 시험 실시",
          "[전기공사] 분전반 인입 간선 배관 라인 마킹 및 지지대 설치",
        ],
        manpower: [
          { trade: "철근공", count: 8 },
          { trade: "형틀목수", count: 5 },
          { trade: "보통인부", count: 4 },
          { trade: "콘크리트공", count: 3 },
          { trade: "전기공", count: 2 },
          { trade: "설비공", count: 2 },
        ],
        totalManpowerToday: 24,
        cumulativeManpower: 268,
        equipment: ["25톤 크레인 1대", "콘크리트 펌프카 1대", "고주파 바이브레이터 4대"],
        material: ["이형철근 D25 (40톤)", "스페이서 블록 2,000개", "결속선 6박스"],
        safetyNotes: "TBM 실시(07:00): 개구부 추락주의 및 레미콘 타설 호스 협착 방지 집중 교육 완료. 전원 보호구 착용 철저.",
        photos: [
          {
            id: "DLP-01",
            url: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
            trade: "골조공사 (철근 배근)",
            location: "지하 2층 B-3구역 매트기초",
            caption: "상하부근 배근 간격 D25 @200 및 이음길이 준수 완료",
            timestamp: `${new Date().toISOString().split("T")[0]} 10:30`,
          },
          {
            id: "DLP-02",
            url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
            trade: "골조공사 (피복두께)",
            location: "지하 2층 C열 외벽 접합부",
            caption: "피복두께 80mm 확보용 스페이서 1m 간격 배치",
            timestamp: `${new Date().toISOString().split("T")[0]} 11:15`,
          },
          {
            id: "DLP-03",
            url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
            trade: "안전시설 (개구부)",
            location: "지상 1층 E/V 피트 개구부",
            caption: "개구부 안전덮개 체결 및 추락주의 경고 표지 부착",
            timestamp: `${new Date().toISOString().split("T")[0]} 14:20`,
          },
          {
            id: "DLP-04",
            url: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=800&q=80",
            trade: "거푸집공사",
            location: "지하 1층 주차장 슬래브 하부",
            caption: "동바리 수평연결재 2방향 체결 및 침하방지판 설치",
            timestamp: `${new Date().toISOString().split("T")[0]} 15:40`,
          },
        ],
      };

  const [activeLog, setActiveLog] = useState<DailyWorkLog>(currentLog);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("preview");
  const [isWatermarking, setIsWatermarking] = useState(false);

  // 작업일보 변경 시 부모 컴포넌트에 반영
  const saveLogChanges = (updatedLog: DailyWorkLog) => {
    setActiveLog(updatedLog);
    if (onUpdateSite) {
      const updatedSite = {
        ...site,
        dailyLogs: [updatedLog, ...(site.dailyLogs || []).filter((l) => l.id !== updatedLog.id)],
      };
      onUpdateSite(updatedSite);
    }
  };

  // 인원 증감 헬퍼
  const handleManpowerChange = (trade: string, delta: number) => {
    const existing = activeLog.manpower.find((m) => m.trade === trade);
    let newManpower: TradeManpower[];
    if (existing) {
      newManpower = activeLog.manpower
        .map((m) => (m.trade === trade ? { ...m, count: Math.max(0, m.count + delta) } : m))
        .filter((m) => m.count > 0);
    } else if (delta > 0) {
      newManpower = [...activeLog.manpower, { trade, count: delta }];
    } else {
      return;
    }

    const totalToday = newManpower.reduce((acc, cur) => acc + cur.count, 0);
    const updated = {
      ...activeLog,
      manpower: newManpower,
      totalManpowerToday: totalToday,
      cumulativeManpower: (activeLog.cumulativeManpower || 250) + delta,
    };
    saveLogChanges(updated);
  };

  // 엑셀 다운로드
  const handleDownloadExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportDailyLogToExcel(site, activeLog);
      onNotify?.("공사 작업일보 엑셀(.xlsx) 파일이 다운로드되었습니다.");
    } catch (e) {
      console.error(e);
      onNotify?.("엑셀 생성 중 오류가 발생했습니다.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // PDF 다운로드
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportDailyLogToPdf(site, activeLog, "daily-log-preview-sheet");
      onNotify?.("발주처 제출용 표준 A4 작업일보 PDF 파일이 다운로드되었습니다.");
    } catch (e) {
      console.error(e);
      onNotify?.("PDF 변환 중 오류가 발생했습니다.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 사진 업로드 및 자동 워터마크 각인
  const handlePhotoUploadWithWatermark = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsWatermarking(true);
    onNotify?.("사진에 날짜·위치·현장명 워터마크 자동 각인 중...");

    try {
      const stampedUrl = await stampPhotoWithWatermark(file, {
        siteName: site.siteName,
        location: "지하 2층 공구",
        trade: "골조·시공",
        author: activeLog.author,
      });

      const newPhoto: DailyWorkPhoto = {
        id: `DLP-${Date.now()}`,
        url: stampedUrl,
        trade: "현장시공",
        location: "현장 지정구역",
        caption: "현장 실측 및 시공 완료 사진",
        timestamp: getFormattedCurrentTime(),
      };

      const updated = {
        ...activeLog,
        photos: [newPhoto, ...activeLog.photos],
      };
      saveLogChanges(updated);
      onNotify?.("📸 워터마크가 각인된 현장 사진이 작업일보에 추가되었습니다.");
    } catch (err) {
      console.error(err);
      onNotify?.("사진 처리 중 오류가 발생했습니다.");
    } finally {
      setIsWatermarking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. 상단 컨트롤 및 안내 바 */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-black uppercase tracking-wider border border-blue-400/30">
                현장공정노트
              </span>
              <span className="text-xs text-blue-200">
                국토교통부 표준 시공·작업일보 서식 호환
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>일일 공사 작업일보 자동화</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">
                원클릭 변환
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium break-keep">
              현장에서 입력한 출역 인원, 작업 내용, 타임스탬프 각인 사진이 결합되어 <strong>발주처 및 감리단 제출용 정형화된 A4 보고서</strong>로 자동 완성됩니다.
            </p>
          </div>

          {/* 원클릭 출력 및 다운로드 버튼군 */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 편집 / 프리뷰 뷰 토글 */}
            <div className="bg-slate-800/80 p-1 rounded-xl flex items-center border border-slate-700">
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                A4 제출용 서식
              </button>
              <button
                onClick={() => setViewMode("edit")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "edit"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                퀵 입력·편집
              </button>
            </div>

            {/* 엑셀 (.xlsx) 다운로드 */}
            <button
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
              title="국토부 표준 시공일보 엑셀 다운로드"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>{isExportingExcel ? "생성중..." : "Excel 작업일보 (.xlsx)"}</span>
            </button>

            {/* A4 PDF 직접 다운로드 */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
              title="A4 PDF 직접 다운로드"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{isExportingPdf ? "변환중..." : "PDF 직접 다운로드 (.pdf)"}</span>
            </button>

            {/* 브라우저 인쇄 */}
            <button
              onClick={() => window.print()}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="인쇄"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 빠른 입력 & 편집 패널 (viewMode === "edit" 또는 상단 요약) */}
      {/* ========================================================= */}
      {viewMode === "edit" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-blue-600" />
              <span>금일 현장 작업 데이터 퀵 입력</span>
            </h4>
            <span className="text-xs text-slate-500">
              보고일자: <strong className="text-slate-800">{activeLog.reportDate}</strong>
            </span>
          </div>

          {/* 날씨 & 기온 & 작성자 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">현장 날씨</label>
              <select
                value={activeLog.weather}
                onChange={(e) => saveLogChanges({ ...activeLog, weather: e.target.value })}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                {WEATHER_OPTIONS.map((w) => (
                  <option key={w} value={w.split(" ")[0]}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">기온 (최저 / 최고 ℃)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={activeLog.temperatureLow}
                  onChange={(e) =>
                    saveLogChanges({ ...activeLog, temperatureLow: Number(e.target.value) })
                  }
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50"
                  placeholder="최저"
                />
                <span className="text-slate-400">~</span>
                <input
                  type="number"
                  value={activeLog.temperatureHigh}
                  onChange={(e) =>
                    saveLogChanges({ ...activeLog, temperatureHigh: Number(e.target.value) })
                  }
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50"
                  placeholder="최고"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">작성자 / 책임소장</label>
              <input
                type="text"
                value={activeLog.author}
                onChange={(e) => saveLogChanges({ ...activeLog, author: e.target.value })}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* 공종별 출역 현황 (원클릭 카운터) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>공종별 출역 인원 현황 (원클릭 +/- 카운터)</span>
              </label>
              <div className="text-xs font-black text-blue-600">
                금일 합계: {activeLog.totalManpowerToday}명 (누계 {activeLog.cumulativeManpower}명)
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {COMMON_TRADES.map((trade) => {
                const item = activeLog.manpower.find((m) => m.trade === trade);
                const count = item ? item.count : 0;
                return (
                  <div
                    key={trade}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      count > 0
                        ? "bg-blue-50/80 border-blue-200 shadow-2xs"
                        : "bg-slate-50 border-slate-200 opacity-70"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">{trade}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleManpowerChange(trade, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-blue-700 w-5 text-center">
                        {count}
                      </span>
                      <button
                        onClick={() => handleManpowerChange(trade, 1)}
                        className="w-6 h-6 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 작업 내용 편집 (금일 완료 & 명일 예정) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>금일 주요 작업 내용 (한 줄에 하나씩)</span>
              </label>
              <textarea
                rows={4}
                value={activeLog.todayWork.join("\n")}
                onChange={(e) =>
                  saveLogChanges({
                    ...activeLog,
                    todayWork: e.target.value.split("\n").filter((l) => l.trim()),
                  })
                }
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white leading-relaxed"
                placeholder="[골조공사] 지하 2층 매트기초 철근 배근 완료..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>명일 작업 예정 사항</span>
              </label>
              <textarea
                rows={4}
                value={activeLog.tomorrowWork.join("\n")}
                onChange={(e) =>
                  saveLogChanges({
                    ...activeLog,
                    tomorrowWork: e.target.value.split("\n").filter((l) => l.trim()),
                  })
                }
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white leading-relaxed"
                placeholder="[골조공사] 레미콘 타설 예정 (320m³)..."
              />
            </div>
          </div>

          {/* 장비 & 자재 & TBM 안전메모 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>투입 장비 (쉼표 구분)</span>
              </label>
              <input
                type="text"
                value={activeLog.equipment.join(", ")}
                onChange={(e) =>
                  saveLogChanges({
                    ...activeLog,
                    equipment: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50"
                placeholder="25톤 크레인 1대, 펌프카 1대"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                <span>주요 자재 반입 (쉼표 구분)</span>
              </label>
              <input
                type="text"
                value={activeLog.material.join(", ")}
                onChange={(e) =>
                  saveLogChanges({
                    ...activeLog,
                    material: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50"
                placeholder="D25 철근 40톤, 결속선 6박스"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>일일 안전점검(TBM) 특기사항</span>
              </label>
              <input
                type="text"
                value={activeLog.safetyNotes}
                onChange={(e) => saveLogChanges({ ...activeLog, safetyNotes: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50"
                placeholder="TBM 실시: 추락 방지 안전고리 2중 체결 철저"
              />
            </div>
          </div>

          {/* 사진 추가 및 워터마크 자동 각인 */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              현재 등록된 보고서 사진: <strong>{activeLog.photos.length}장</strong> (타임스탬프 각인 완료)
            </span>

            <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isWatermarking ? "워터마크 각인 중..." : "+ 사진 추가 (날짜·위치 각인)"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUploadWithWatermark}
                disabled={isWatermarking}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. 발주처 제출용 표준 A4 작업일보 프리뷰 시트 */}
      {/* ========================================================= */}
      <div className="flex justify-center">
        <div
          id="daily-log-preview-sheet"
          className="w-full max-w-[850px] bg-white border border-slate-300 shadow-xl rounded-xl p-8 sm:p-12 text-[#0F172A] font-sans print:border-none print:shadow-none print:p-0"
          style={{ minHeight: "1050px" }}
        >
          {/* A4 시트 상단 제목 및 결재란 */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-4 mb-4 gap-4">
            <div>
              <div className="text-[11px] font-bold text-blue-700 tracking-wider uppercase">
                Construction Daily Work Progress Report
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                공 사 작 업 일 보
              </h2>
              <div className="text-xs text-slate-500 font-medium mt-1">
                현장명: <strong className="text-slate-800">{site.siteName}</strong>
              </div>
            </div>

            {/* 결재란 (국토부/시공사 제출 표준 4단 결재 도장란) */}
            <div className="shrink-0">
              <table className="border-collapse border border-slate-700 text-center text-[10px] w-full sm:w-auto">
                <tbody>
                  <tr className="bg-slate-100 font-bold border-b border-slate-700">
                    <td className="w-12 py-1 border-r border-slate-700">구분</td>
                    <td className="w-16 py-1 border-r border-slate-700">담 당</td>
                    <td className="w-16 py-1 border-r border-slate-700">공 무</td>
                    <td className="w-16 py-1 border-r border-slate-700">현장소장</td>
                    <td className="w-16 py-1">감리단장</td>
                  </tr>
                  <tr className="h-14 font-semibold text-slate-400">
                    <td className="bg-slate-50 font-bold text-slate-700 border-r border-slate-700 text-[9px]">
                      결<br />재
                    </td>
                    <td className="border-r border-slate-700 align-bottom pb-1 text-[10px] text-slate-600">
                      김현우 (인)
                    </td>
                    <td className="border-r border-slate-700 align-bottom pb-1 text-[10px] text-slate-600">
                      서명
                    </td>
                    <td className="border-r border-slate-700 align-bottom pb-1 text-[10px] text-emerald-700 font-bold">
                      [확인필]
                    </td>
                    <td className="align-bottom pb-1 text-[10px] text-slate-400">
                      (승인)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 공사 기본 정보 테이블 */}
          <table className="w-full border-collapse border border-slate-400 text-xs mb-4">
            <tbody>
              <tr className="border-b border-slate-400">
                <td className="w-24 bg-slate-100 font-bold p-2 text-center border-r border-slate-400">
                  보고 일자
                </td>
                <td className="p-2 border-r border-slate-400 font-medium">
                  {activeLog.reportDate} (
                  {new Date(activeLog.reportDate).toLocaleDateString("ko-KR", { weekday: "short" })}요일)
                </td>
                <td className="w-24 bg-slate-100 font-bold p-2 text-center border-r border-slate-400">
                  기상 상황
                </td>
                <td className="p-2 font-medium">
                  {activeLog.weather} / {activeLog.temperatureLow}℃ ~ {activeLog.temperatureHigh}℃
                </td>
              </tr>
              <tr className="border-b border-slate-400">
                <td className="bg-slate-100 font-bold p-2 text-center border-r border-slate-400">
                  현장 위치
                </td>
                <td className="p-2 border-r border-slate-400 font-medium truncate max-w-[200px]">
                  {site.address}
                </td>
                <td className="bg-slate-100 font-bold p-2 text-center border-r border-slate-400">
                  발주처 / 고객사
                </td>
                <td className="p-2 font-medium">{site.client}</td>
              </tr>
            </tbody>
          </table>

          {/* 출역 현황 집계표 */}
          <div className="mb-4">
            <div className="text-xs font-black text-slate-900 mb-1.5 flex items-center justify-between">
              <span>■ 금일 출역 및 투입 인원 현황</span>
              <span className="text-[11px] text-blue-700">
                금일 투입: <strong>{activeLog.totalManpowerToday}명</strong> / 누계 투입:{" "}
                <strong>{activeLog.cumulativeManpower}명</strong>
              </span>
            </div>
            <table className="w-full border-collapse border border-slate-400 text-[11px] text-center">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-400">
                  {activeLog.manpower.map((m) => (
                    <th key={m.trade} className="p-1.5 border-r border-slate-400 last:border-r-0">
                      {m.trade}
                    </th>
                  ))}
                  <th className="p-1.5 bg-blue-50 text-blue-900 font-black">금일 합계</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-400 font-bold">
                  {activeLog.manpower.map((m) => (
                    <td key={m.trade} className="p-1.5 border-r border-slate-400 last:border-r-0 text-slate-800">
                      {m.count}명
                    </td>
                  ))}
                  <td className="p-1.5 bg-blue-50 text-blue-800 font-black">
                    {activeLog.totalManpowerToday}명
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 금일 시공 내용 & 명일 시공 계획 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* 금일 시공 내역 */}
            <div className="border border-slate-400 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-400 font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>금일 주요 작업 내역 (Work Completed)</span>
              </div>
              <div className="p-3 text-xs space-y-1.5 min-h-[90px] bg-white font-medium">
                {activeLog.todayWork.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold shrink-0">{idx + 1}.</span>
                    <span className="text-slate-800">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 명일 시공 계획 */}
            <div className="border border-slate-400 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-400 font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>명일 작업 예정 사항 (Planned Work)</span>
              </div>
              <div className="p-3 text-xs space-y-1.5 min-h-[90px] bg-white font-medium">
                {activeLog.tomorrowWork.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-bold shrink-0">{idx + 1}.</span>
                    <span className="text-slate-700">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 주요 자재 및 장비 투입 + 안전 메모 */}
          <table className="w-full border-collapse border border-slate-400 text-xs mb-4">
            <tbody>
              <tr className="border-b border-slate-400">
                <td className="w-24 bg-slate-100 font-bold p-2 text-center border-r border-slate-400">
                  투입 장비
                </td>
                <td className="p-2 border-r border-slate-400 font-medium">
                  {activeLog.equipment.join(" / ") || "해당없음"}
                </td>
                <td className="w-24 bg-slate-100 font-bold p-2 text-center border-r border-slate-400">
                  주요 자재
                </td>
                <td className="p-2 font-medium">
                  {activeLog.material.join(" / ") || "해당없음"}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 font-bold p-2 text-center border-r border-slate-400">
                  TBM / 안전점검
                </td>
                <td colSpan={3} className="p-2 font-medium text-slate-800">
                  {activeLog.safetyNotes}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 공종별 현장 사진 대지 (날짜·시간·위치 워터마크 각인 사진) */}
          <div>
            <div className="text-xs font-black text-slate-900 mb-2 flex items-center justify-between">
              <span>■ 공종별 주요 시공 사진 (타임스탬프 및 위치 자동 각인)</span>
              <span className="text-[10px] text-slate-500 font-medium">
                위변조 방지 인증: CheckReport™ Certified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {activeLog.photos.slice(0, 4).map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="border border-slate-400 rounded-lg overflow-hidden bg-slate-50 flex flex-col"
                  style={{ pageBreakInside: "avoid" }}
                >
                  <div className="relative aspect-[4/3] bg-slate-900">
                    <img
                      src={p.url}
                      alt={p.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                      #{idx + 1} {p.trade}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white border-t border-slate-300 text-[10px] space-y-0.5">
                    <div className="font-bold text-slate-900 truncate">{p.caption}</div>
                    <div className="text-slate-500 flex items-center justify-between">
                      <span className="text-blue-700 font-semibold truncate">📍 {p.location}</span>
                      <span className="text-slate-400 font-mono shrink-0">⏱️ {p.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 서명 확인 하단 푸터 */}
          <div className="mt-8 pt-4 border-t border-slate-400 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              상기와 같이 일일 공사 및 현장 작업 내용을 정확히 기록하여 보고서를 제출합니다.
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{site.siteName} 공사관리단</span>
              <div className="border border-blue-600 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px]">
                발주처 제출용
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
