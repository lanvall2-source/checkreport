import React, { useState, useEffect } from "react";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Sparkles,
  Wifi,
  ChevronLeft,
  Check,
  Upload,
  AlertTriangle,
  RotateCcw,
  Loader2,
  FileCheck2,
} from "lucide-react";
import { DEMO_SITES, SAMPLE_PHOTOS } from "@/lib/constants";
import { compressImage } from "@/lib/imageCompressor";
import type { InspectionSite, CheckItem, InspectionStatus } from "@/types";

interface MobileRemoteViewProps {
  initialSiteId?: string;
  onExitRemote?: () => void;
}

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
  const [syncToast, setSyncToast] = useState<{ message: string; type: "success" | "loading" | "error" } | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<string | null>(null);

  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // 기기간 동기화 데이터 전송
  const broadcastUpdate = async (updatedSites: InspectionSite[], message: string) => {
    setSites(updatedSites);
    try {
      localStorage.setItem("checkreport_sites", JSON.stringify(updatedSites));
    } catch {
      // ignore
    }

    // 1. 브라우저 간 BroadcastChannel 전송
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("checkreport_sync_channel");
        bc.postMessage({ type: "UPDATE_SITES", sites: updatedSites });
        bc.close();
      }
    } catch {
      // ignore
    }

    // 2. 서버리스 API 동기화 (스마트폰 ↔ PC)
    setSyncToast({ message: "📡 PC 대시보드로 무선 전송 중...", type: "loading" });
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedSiteId,
          data: updatedSites,
          sender: "smartphone-remote",
        }),
      });

      if (!res.ok) {
        throw new Error(`서버 응답 오류 (${res.status})`);
      }

      setSyncToast({ message: `✅ ${message}`, type: "success" });
      setTimeout(() => setSyncToast(null), 3000);
    } catch (err: any) {
      console.error("Sync API error:", err);
      setSyncToast({ message: `❌ 동기화 실패: ${err.message || "네트워크 오류"}`, type: "error" });
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  // 사진 업로드/촬영 핸들러 (스마트폰 10MB 원본 -> 120KB 스마트 압축)
  const handlePhotoUpload = async (itemId: string, type: "before" | "after", file: File) => {
    setIsProcessingPhoto(itemId);
    setSyncToast({ message: `⏳ 고화질 사진 압축 중... (${Math.round(file.size / 1024)}KB)`, type: "loading" });

    try {
      const compressResult = await compressImage(file, 1024, 1024, 0.75);

      const updatedSites = sites.map((site) => {
        if (site.id !== selectedSiteId) return site;
        const updatedItems = site.items.map((it) => {
          if (it.id !== itemId) return it;
          return type === "before"
            ? { ...it, photoBefore: compressResult.dataUrl }
            : { ...it, photoAfter: compressResult.dataUrl, actionStatus: "resolved" as const };
        });
        return { ...site, items: updatedItems };
      });

      await broadcastUpdate(
        updatedSites,
        `사진 전송 완료 (${compressResult.compressedSizeKb}KB로 최적화됨)! PC 모니터를 확인하세요.`
      );
    } catch (err: any) {
      console.error("Photo compress error:", err);
      setSyncToast({ message: "사진 처리 중 오류가 발생했습니다.", type: "error" });
    } finally {
      setIsProcessingPhoto(null);
    }
  };

  // 샘플 사진 원클릭 주입
  const handleInjectSample = (itemId: string, sampleUrl: string, sampleLabel: string) => {
    const updatedSites = sites.map((site) => {
      if (site.id !== selectedSiteId) return site;
      const updatedItems = site.items.map((it) => {
        if (it.id !== itemId) return it;
        return { ...it, photoBefore: sampleUrl };
      });
      return { ...site, items: updatedItems };
    });

    broadcastUpdate(updatedSites, `[${sampleLabel}] 사진이 PC A4 사진대지에 전송되었습니다!`);
  };

  // 점검 상태 토글
  const handleToggleStatus = (itemId: string, newStatus: InspectionStatus) => {
    const updatedSites = sites.map((site) => {
      if (site.id !== selectedSiteId) return site;
      const updatedItems = site.items.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it));
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

    const label = newStatus === "pass" ? "적합 판정" : newStatus === "fail" ? "부적합 지적" : "해당없음";
    broadcastUpdate(updatedSites, `[${label}] 상태가 PC로 실시간 동기화되었습니다.`);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex flex-col pb-20">
      {/* 상단 고정 스마트폰 헤더 */}
      <header className="sticky top-0 z-40 bg-[#2563EB] text-white shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onExitRemote && (
              <button
                onClick={onExitRemote}
                className="p-1 rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="돌아가기"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold tracking-wide uppercase text-blue-100">
                  PC 실시간 무선 연동 중
                </span>
              </div>
              <h1 className="text-base font-black truncate max-w-[210px] leading-tight">
                {currentSite.siteName}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-black leading-tight">{currentSite.progressPercent}%</div>
            <div className="text-[10px] text-blue-200">
              {currentSite.completedItems}/{currentSite.totalItems} 완료
            </div>
          </div>
        </div>

        {/* 동기화 상태 알림 배너 */}
        {syncToast && (
          <div
            className={`px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 transition-all ${
              syncToast.type === "loading"
                ? "bg-amber-500 text-white"
                : syncToast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {syncToast.type === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : syncToast.type === "success" ? (
              <Wifi className="w-4 h-4 animate-pulse" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{syncToast.message}</span>
          </div>
        )}
      </header>

      {/* 메인 점검 카드 리스트 */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 flex-1 space-y-4">
        {/* 안내 카드 */}
        <div className="p-3.5 bg-white rounded-2xl border border-blue-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 leading-snug">
            <strong className="text-slate-900 block font-bold">PC 모니터를 바라보며 사진을 찍어보세요!</strong>
            카메라로 찍은 고용량 사진이 1초 만에 최적화되어 PC 화면의 A4 사진대지에 실시간으로 꽂힙니다.
          </div>
        </div>

        {/* 점검 항목 리스트 */}
        {currentSite.items.map((item, idx) => {
          const isThisLoading = isProcessingPhoto === item.id;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm transition-all space-y-3 ${
                item.status === "fail"
                  ? "border-rose-300 ring-1 ring-rose-200"
                  : item.status === "pass"
                  ? "border-emerald-200"
                  : "border-slate-200"
              }`}
            >
              {/* 항목 헤더 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      No.{idx + 1} · {item.category}
                    </span>
                    {item.status === "pass" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        ✓ 적합
                      </span>
                    )}
                    {item.status === "fail" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                        ✗ 불합격 (지적)
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.standard}</p>
                </div>
              </div>

              {/* 사진 영역 */}
              <div className="space-y-2">
                {item.photoBefore ? (
                  /* 사진이 이미 있는 경우 */
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={item.photoBefore}
                      alt="현장 사진"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      현장 사진 (Before)
                    </div>

                    {/* 재촬영 버튼 */}
                    <label className="absolute top-2 right-2 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 border border-slate-200">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>카메라로 다시 찍기</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        disabled={isThisLoading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(item.id, "before", file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  /* 사진이 없는 경우: 큼직한 카메라 촬영 버튼 */
                  <div className="space-y-2">
                    <label
                      className={`w-full py-4 bg-blue-50/80 hover:bg-blue-100/80 border-2 border-dashed border-blue-300 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-blue-700 cursor-pointer transition-all active:scale-98 ${
                        isThisLoading ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                        {isThisLoading ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6" />
                        )}
                      </div>
                      <span className="text-xs font-black">
                        {isThisLoading ? "사진 압축 및 PC 전송 중..." : "스마트폰 카메라로 현장 촬영하기"}
                      </span>
                      <span className="text-[10px] text-blue-500 font-medium">
                        터치 시 스마트폰 카메라가 즉시 구동됩니다
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        disabled={isThisLoading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(item.id, "before", file);
                        }}
                      />
                    </label>
                  </div>
                )}

                {/* 사진 교체/테스트 버튼 (항상 노출되어 원클릭 실시간 테스트 가능) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">1초 테스트:</span>
                  {SAMPLE_PHOTOS.slice(0, 3).map((sp, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleInjectSample(item.id, sp.url, sp.label)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shrink-0 cursor-pointer transition-colors active:scale-95"
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">빠른 테스트:</span>
                      {SAMPLE_PHOTOS.slice(0, 2).map((sp, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleInjectSample(item.id, sp.url, sp.label)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shrink-0 cursor-pointer transition-colors"
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 불합격 시 조치 후(After) 사진 섹션 */}
                {item.status === "fail" && (
                  <div className="pt-2 border-t border-rose-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>조치 지시 사항</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        기한: {item.actionDeadline || "금일 18:00"}
                      </span>
                    </div>
                    <div className="text-xs bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-rose-900 mb-2">
                      <p className="font-semibold">위치: {item.defectLocation || "현장 확인 필요"}</p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        {item.actionNotes || "보수 조치 후 확인 사진을 등록하세요."}
                      </p>
                    </div>

                    {item.photoAfter ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500">
                        <img src={item.photoAfter} alt="조치 후" className="w-full h-36 object-cover" />
                        <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          ✓ 조치 완료 (After)
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>+ 보수 완료 사진(After) 촬영하기</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(item.id, "after", file);
                            }}
                          />
                        </label>
                        <button
                          onClick={() => handleInjectSample(item.id, SAMPLE_PHOTOS[3].url, "보수 조치완료")}
                          className="w-full py-1.5 bg-slate-100 hover:bg-emerald-50 text-[10px] font-bold text-slate-600 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors"
                        >
                          💡 1초 테스트: 보수 완료 샘플 사진 넣기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 판정 버튼 (합격 / 불합격 / 해당없음) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleToggleStatus(item.id, "pass")}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                    item.status === "pass"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>적합(합격)</span>
                </button>
                <button
                  onClick={() => handleToggleStatus(item.id, "fail")}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                    item.status === "fail"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 font-black"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>부적합(지적)</span>
                </button>
                <button
                  onClick={() => handleToggleStatus(item.id, "na")}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                    item.status === "na"
                      ? "bg-slate-800 text-white shadow-md"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <span>N/A</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* 하단 고정 완료 버튼 */}
        <div className="pt-2 pb-6">
          <button
            onClick={() => broadcastUpdate(sites, "🎉 모든 점검 데이터가 PC 대시보드에 최종 동기화되었습니다!")}
            className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-5 h-5" />
            <span>점검 완료 및 PC 대시보드 최종 전송</span>
          </button>
          <p className="text-[11px] text-center text-slate-400 mt-2">
            ⚡ PC 모니터를 확인하시면 A4 사진대지가 자동으로 완성되어 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
