import React, { useState } from "react";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Sparkles,
  Wifi,
  ChevronLeft,
  Check,
  AlertTriangle,
  Loader2,
  MapPin,
  FileText,
  Send,
  Plus,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { DEMO_SITES } from "@/lib/constants";
import { compressImage } from "@/lib/imageCompressor";
import { saveSitesToCloud } from "@/lib/cloudStore";
import { exportToExcel, exportToPdf } from "@/lib/exportUtils";
import { stampPhotoWithWatermark } from "@/lib/watermarkEngine";
import type { InspectionSite, CheckItem, InspectionStatus } from "@/types";

interface MobileRemoteViewProps {
  initialSiteId?: string;
  onExitRemote?: () => void;
}

// 현장에서 자주 쓰는 빠른 위치 프리셋 칩
const QUICK_LOCATIONS = ["지하 2층", "지하 1층", "1층 로비", "옥상", "기계실", "계단실", "외부 비계"];

// 현장에서 자주 쓰는 빠른 지적 조치 메모 칩
const QUICK_NOTES = ["균열 에폭시 보수", "누수 이음부 체결", "안전 난간대 재설치", "철근 배근 간격 조정", "폐기물 반출 정리"];

export function MobileRemoteView({ initialSiteId = "SITE-2026-001", onExitRemote }: MobileRemoteViewProps) {
  const [sites, setSites] = useState<InspectionSite[]>(() => {
    try {
      const saved = localStorage.getItem("checkreport_sites");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEMO_SITES;
  });

  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [syncToast, setSyncToast] = useState<{ message: string; type: "success" | "loading" | "error" } | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    setSyncToast({ message: "엑셀 파일 (.xlsx) 생성 중...", type: "loading" });
    try {
      await exportToExcel(currentSite);
      setSyncToast({ message: "엑셀 파일 다운로드 완료!", type: "success" });
      setTimeout(() => setSyncToast(null), 3000);
    } catch {
      setSyncToast({ message: "엑셀 생성 실패", type: "error" });
      setTimeout(() => setSyncToast(null), 3000);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setSyncToast({ message: "A4 PDF 보고서 변환 중...", type: "loading" });
    try {
      await exportToPdf(currentSite);
      setSyncToast({ message: "PDF 파일 다운로드 완료!", type: "success" });
      setTimeout(() => setSyncToast(null), 3000);
    } catch {
      setSyncToast({ message: "PDF 변환 실패", type: "error" });
      setTimeout(() => setSyncToast(null), 3000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const currentItem = currentSite.items[activeItemIndex] || currentSite.items[0];

  // 기기간 동기화 전송 (5분 주기 또는 전송 버튼 클릭 시 즉시 전송)
  const broadcastUpdate = async (updatedSites: InspectionSite[], successMsg: string) => {
    setSites(updatedSites);
    try {
      localStorage.setItem("checkreport_sites", JSON.stringify(updatedSites));
    } catch {
      // ignore
    }

    // BroadcastChannel (동일 기기 / 다중 탭)
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("checkreport_sync_channel");
        bc.postMessage({ type: "UPDATE_SITES", sites: updatedSites });
        bc.close();
      }
    } catch {
      // ignore
    }

    // 클라우드(Supabase / 서버리스) 영구 동기화
    setSyncToast({ message: "PC 대시보드로 전송 중...", type: "loading" });
    try {
      await saveSitesToCloud(updatedSites);
      setSyncToast({ message: successMsg, type: "success" });
      setTimeout(() => setSyncToast(null), 3000);
    } catch (err: any) {
      setSyncToast({ message: "전송 오류 (재시도 해주세요)", type: "error" });
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // 사진 촬영 및 1024px 스마트 압축
  const handlePhotoCapture = async (file: File) => {
    setIsProcessingPhoto(true);
    setSyncToast({ message: "사진 압축 및 최적화 중...", type: "loading" });

    try {
      const compressResult = await compressImage(file, 1024, 1024, 0.75);
      let stampedUrl = compressResult.dataUrl;

      // 사진 법적 효력 타임스탬프 & 위치 워터마크 자동 각인
      try {
        stampedUrl = await stampPhotoWithWatermark(compressResult.dataUrl, {
          siteName: currentSite.siteName,
          location: currentItem.defectLocation || "현장 모바일 점검",
          trade: currentItem.category || "현장공정",
          author: currentSite.managerName,
        });
      } catch (wErr) {
        console.warn("Mobile watermark stamping skipped", wErr);
      }

      const updatedSites = sites.map((site) => {
        if (site.id !== selectedSiteId) return site;
        const updatedItems = site.items.map((it, idx) => {
          if (idx !== activeItemIndex) return it;
          return {
            ...it,
            photoBefore: stampedUrl,
            status: it.status === "pending" ? ("pass" as const) : it.status,
          };
        });
        return { ...site, items: updatedItems };
      });

      await broadcastUpdate(updatedSites, "📸 현장 사진이 저장되었습니다.");
    } catch (err) {
      setSyncToast({ message: "사진 처리 실패", type: "error" });
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // 위치 빠른 선택
  const handleSelectLocation = (loc: string) => {
    const updatedSites = sites.map((site) => {
      if (site.id !== selectedSiteId) return site;
      const updatedItems = site.items.map((it, idx) => {
        if (idx !== activeItemIndex) return it;
        return { ...it, defectLocation: loc };
      });
      return { ...site, items: updatedItems };
    });
    setSites(updatedSites);
    localStorage.setItem("checkreport_sites", JSON.stringify(updatedSites));
  };

  // 판정 토글 (적합 / 지적)
  const handleSetStatus = (status: InspectionStatus) => {
    const updatedSites = sites.map((site) => {
      if (site.id !== selectedSiteId) return site;
      const updatedItems = site.items.map((it, idx) => {
        if (idx !== activeItemIndex) return it;
        return { ...it, status };
      });
      const completed = updatedItems.filter((i) => i.status !== "pending").length;
      const failed = updatedItems.filter((i) => i.status === "fail").length;
      const percent = Math.round((completed / updatedItems.length) * 100);

      return {
        ...site,
        items: updatedItems,
        completedItems: completed,
        failedItems: failed,
        progressPercent: percent,
      };
    });

    const label = status === "pass" ? "적합 등록 완료" : status === "fail" ? "지적 등록 완료" : "N/A";
    broadcastUpdate(updatedSites, `✓ [${label}]`);
  };

  // 조치 지시 메모 선택
  const handleSelectNote = (note: string) => {
    const updatedSites = sites.map((site) => {
      if (site.id !== selectedSiteId) return site;
      const updatedItems = site.items.map((it, idx) => {
        if (idx !== activeItemIndex) return it;
        return { ...it, actionNotes: note };
      });
      return { ...site, items: updatedItems };
    });
    setSites(updatedSites);
    localStorage.setItem("checkreport_sites", JSON.stringify(updatedSites));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col pb-16">
      {/* 상단 간결한 모바일 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {onExitRemote && (
              <button
                onClick={onExitRemote}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                aria-label="돌아가기"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap inline-block">
                모바일 현장 촬영
              </span>
              <h1 className="text-xs sm:text-sm font-black truncate text-white mt-0.5">
                {currentSite.siteName}
              </h1>
            </div>
          </div>

          <div className="text-right whitespace-nowrap shrink-0">
            <span className="text-xs font-black text-emerald-400 block">
              {activeItemIndex + 1} / {currentSite.items.length} 항목
            </span>
            <span className="text-[10px] text-slate-400">
              완료: {currentSite.completedItems}건
            </span>
          </div>
        </div>

        {/* 상태 토스트 알림 */}
        {syncToast && (
          <div
            className={`mt-2 py-1.5 px-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 break-keep ${
              syncToast.type === "loading"
                ? "bg-amber-500 text-slate-950"
                : syncToast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {syncToast.type === "loading" && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
            <span className="truncate">{syncToast.message}</span>
          </div>
        )}
      </header>

      {/* 메인 현장 점검 영역 (현장 작업자 맞춤 극단적 심플 UX) */}
      <main className="max-w-md mx-auto w-full px-4 pt-3 flex-1 flex flex-col space-y-3.5">
        {/* 항목 스크롤 탭 바 */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
          {currentSite.items.map((it, idx) => (
            <button
              key={it.id}
              onClick={() => setActiveItemIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                idx === activeItemIndex
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{idx + 1}. {it.category}</span>
              {it.photoBefore && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
            </button>
          ))}
        </div>

        {/* 현재 점검 항목 카드 */}
        <div className="bg-slate-800/90 rounded-3xl p-4 border border-slate-700/80 shadow-xl space-y-3.5">
          <div>
            <span className="text-[11px] font-bold text-blue-400 block mb-0.5">
              No.{activeItemIndex + 1} · {currentItem.category}
            </span>
            <h2 className="text-sm sm:text-base font-black text-white leading-snug break-keep">
              {currentItem.title}
            </h2>
            {currentItem.standard && (
              <p className="text-[11px] text-slate-400 mt-1.5 break-keep leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/50">
                📋 <strong className="text-slate-300">점검 기준:</strong> {currentItem.standard}
              </p>
            )}
          </div>

          {/* 1. 큼직한 사진 촬영 영역 */}
          <div>
            {currentItem.photoBefore ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-600 aspect-4/3 group">
                <img
                  src={currentItem.photoBefore}
                  alt="현장 사진"
                  className="w-full h-full object-cover"
                />
                <label className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5 border border-slate-700 active:scale-95 transition-transform whitespace-nowrap">
                  <Camera className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>사진 다시 찍기</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={isProcessingPhoto}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoCapture(file);
                    }}
                  />
                </label>
              </div>
            ) : (
              <label
                className={`w-full aspect-4/3 rounded-2xl border-2 border-dashed border-blue-500/60 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${
                  isProcessingPhoto ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40">
                  {isProcessingPhoto ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Camera className="w-7 h-7" />
                  )}
                </div>
                <div className="text-center px-4">
                  <span className="text-sm font-black text-white block break-keep">
                    현장 사진 촬영하기 (터치)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block break-keep">
                    카메라가 켜지며 고화질 1024px로 자동 압축됩니다
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={isProcessingPhoto}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoCapture(file);
                  }}
                />
              </label>
            )}
          </div>

          {/* 2. 위치 선택 (원터치 칩) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>위치 선택 (터치):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleSelectLocation(loc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    currentItem.defectLocation === loc
                      ? "bg-blue-600 text-white border-blue-500 font-black shadow-xs"
                      : "bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 판정 (적합 / 지적 - 큼직한 2버튼) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400">점검 판정:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSetStatus("pass")}
                className={`py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 border whitespace-nowrap ${
                  currentItem.status === "pass"
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30"
                    : "bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>적합 (통과)</span>
              </button>

              <button
                onClick={() => handleSetStatus("fail")}
                className={`py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 border whitespace-nowrap ${
                  currentItem.status === "fail"
                    ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30"
                    : "bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700"
                }`}
              >
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>지적 (불합격)</span>
              </button>
            </div>
          </div>

          {/* 지적 시 간단 조치 메모 칩 선택 */}
          {currentItem.status === "fail" && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-2xl space-y-2 animate-in fade-in duration-150">
              <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>조치 지시 사항 선택:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_NOTES.map((note) => (
                  <button
                    key={note}
                    onClick={() => handleSelectNote(note)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      currentItem.actionNotes === note
                        ? "bg-rose-600 text-white border-rose-500 font-bold"
                        : "bg-slate-800 text-rose-200 border-rose-900/60 hover:bg-slate-700"
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 모바일 현장 보고서 즉시 다운로드 버튼 바 */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-98 text-emerald-400 font-bold text-[11px] rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span>{isExportingExcel ? "생성중..." : "Excel 저장 (.xlsx)"}</span>
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-98 text-rose-400 font-bold text-[11px] rounded-xl border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>{isExportingPdf ? "변환중..." : "PDF 저장 (.pdf)"}</span>
          </button>
        </div>

        {/* 하단 이전/다음 항목 이동 및 최종 전송 바 */}
        <div className="flex items-center gap-2 pb-4">
          <button
            onClick={() => setActiveItemIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeItemIndex === 0}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            ← 이전
          </button>

          {activeItemIndex < currentSite.items.length - 1 ? (
            <button
              onClick={() => setActiveItemIndex((prev) => prev + 1)}
              className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 whitespace-nowrap"
            >
              <span>다음 항목</span>
              <span>→</span>
            </button>
          ) : (
            <button
              onClick={() => broadcastUpdate(sites, "🎉 전체 점검이 완료되어 PC 보고서로 전송되었습니다.")}
              className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 whitespace-nowrap"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>전체 점검 전송 완료</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
