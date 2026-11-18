import React, { useState, useEffect, useRef } from "react";
import {
  MonitorCheck,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Calendar,
  Camera,
  Check,
  Sparkles,
  Wifi,
  ExternalLink,
  QrCode,
  ArrowRight,
  RefreshCw,
  Eye,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { DEMO_SITES, SAMPLE_PHOTOS } from "@/lib/constants";
import { printInspectionReport } from "./ReportPrintModal";
import { RemoteQrModal } from "./RemoteQrModal";
import type { InspectionSite, CheckItem, InspectionStatus, UserSession } from "@/types";

interface DualInspectionDemoProps {
  userSession?: UserSession | null;
}

export function DualInspectionDemo({ userSession }: DualInspectionDemoProps = {}) {
  // 1. 점검 현장 상태 (로컬 스토리지 또는 DEMO_SITES)
  const [sites, setSites] = useState<InspectionSite[]>(() => {
    try {
      const saved = localStorage.getItem("checkreport_sites");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEMO_SITES;
  });

  const [selectedSiteId, setSelectedSiteId] = useState<string>("SITE-2026-001");
  const [activeAdminTab, setActiveAdminTab] = useState<"items" | "defects" | "report">("items");
  const [mobileViewTab, setMobileViewTab] = useState<"mobile" | "admin">("mobile"); // 모바일 기기 접속 시 탭 전환
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // 동기화 시각 피드백 상태
  const [lastSyncedItemId, setLastSyncedItemId] = useState<string | null>(null);
  const [syncBannerMessage, setSyncBannerMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSubmittingMobile, setIsSubmittingMobile] = useState<boolean>(false);
  const [mobileSubmitted, setMobileSubmitted] = useState<boolean>(false);

  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // 세션 회사명 동기화
  useEffect(() => {
    if (userSession) {
      setSites((prev) =>
        prev.map((s, idx) =>
          idx === 0
            ? {
                ...s,
                client: userSession.companyName || s.client,
                managerName: userSession.managerName ? `${userSession.managerName} 담당자` : s.managerName,
              }
            : s
        )
      );
    }
  }, [userSession]);

  // 2. 실시간 크로스 디바이스(스마트폰 ↔ PC) 동기화 리스너 & 폴링
  useEffect(() => {
    // (A) BroadcastChannel (동일 기기 / 다중 탭 즉시 동기화)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("checkreport_sync_channel");
        bc.onmessage = (event) => {
          if (event.data?.type === "UPDATE_SITES" && event.data.sites) {
            setSites(event.data.sites);
            triggerSyncFeedback("⚡ 스마트폰에서 전송된 최신 사진과 점검 내역이 동기화되었습니다!");
          }
        };
      }
    } catch {
      // ignore
    }

    // (B) 서버리스 폴링 (실제 스마트폰 ↔ PC 서로 다른 기기간 동기화)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sync?roomId=${selectedSiteId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.exists && json.data) {
          const remoteSites: InspectionSite[] = json.data;
          // 변경점이 있을 때만 업데이트
          setSites((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(remoteSites)) {
              triggerSyncFeedback("⚡ 스마트폰에서 새 현장 사진이 도착했습니다! (A4 사진대지 반영)");
              return remoteSites;
            }
            return prev;
          });
        }
      } catch {
        // network polling error ignore
      }
    }, 2000);

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [selectedSiteId]);

  // 동기화 시각 피드백 트리거
  const triggerSyncFeedback = (message: string, itemId?: string) => {
    setSyncBannerMessage(message);
    if (itemId) setLastSyncedItemId(itemId);
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncBannerMessage(null);
      setLastSyncedItemId(null);
    }, 3500);
  };

  // 상태 업데이트 및 서버/로컬 브로드캐스트
  const updateAndBroadcastSites = async (
    updater: (prev: InspectionSite[]) => InspectionSite[],
    feedbackMsg: string,
    targetItemId?: string
  ) => {
    const updated = updater(sites);
    setSites(updated);
    try {
      localStorage.setItem("checkreport_sites", JSON.stringify(updated));
    } catch {
      // ignore
    }

    // BroadcastChannel
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("checkreport_sync_channel");
        bc.postMessage({ type: "UPDATE_SITES", sites: updated });
        bc.close();
      }
    } catch {
      // ignore
    }

    // Vercel Serverless Sync API
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedSiteId,
          data: updated,
          sender: "demo-simulator",
        }),
      });
    } catch {
      // ignore
    }

    triggerSyncFeedback(feedbackMsg, targetItemId);
  };

  // 모바일 점검 항목 상태 토글
  const handleToggleStatus = (itemId: string, newStatus: InspectionStatus) => {
    updateAndBroadcastSites(
      (prevSites) =>
        prevSites.map((site) => {
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
        }),
      `✓ [${newStatus === "pass" ? "적합 판정" : newStatus === "fail" ? "부적합 지적" : "N/A"}] 동기화 완료!`,
      itemId
    );
  };

  // 실제 사진 업로드 핸들러 (Before / After)
  const handlePhotoUpload = (itemId: string, type: "before" | "after", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateAndBroadcastSites(
        (prevSites) =>
          prevSites.map((site) => {
            if (site.id !== selectedSiteId) return site;
            const updatedItems = site.items.map((it) => {
              if (it.id !== itemId) return it;
              return type === "before"
                ? { ...it, photoBefore: dataUrl }
                : { ...it, photoAfter: dataUrl, actionStatus: "resolved" as const };
            });
            return { ...site, items: updatedItems };
          }),
        "📸 모바일에서 촬영한 사진이 PC 관리자 콘솔과 A4 사진대지에 1초 만에 꽂혔습니다!",
        itemId
      );
    };
    reader.readAsDataURL(file);
  };

  // 샘플 사진 원클릭 주입 핸들러
  const handleInjectSamplePhoto = (itemId: string, sampleUrl: string, sampleLabel: string) => {
    updateAndBroadcastSites(
      (prevSites) =>
        prevSites.map((site) => {
          if (site.id !== selectedSiteId) return site;
          const updatedItems = site.items.map((it) => {
            if (it.id !== itemId) return it;
            return { ...it, photoBefore: sampleUrl };
          });
          return { ...site, items: updatedItems };
        }),
      `⚡ [${sampleLabel}] 사진이 PC A4 사진대지 보고서에 실시간 반영되었습니다!`,
      itemId
    );
  };

  // 모바일 점검 완료 제출
  const handleMobileSubmit = () => {
    setIsSubmittingMobile(true);
    setTimeout(() => {
      setIsSubmittingMobile(false);
      setMobileSubmitted(true);
      setActiveAdminTab("report"); // 자동으로 PC 보고서 탭으로 전환
      triggerSyncFeedback("🎉 모바일 점검 완료! A4 2단 사진대지 보고서가 생성되었습니다.");
      setTimeout(() => setMobileSubmitted(false), 3000);
    }, 600);
  };

  const defectItems = currentSite.items.filter((i) => i.status === "fail");

  return (
    <section id="demo" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 섹션 제목 */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>실시간 기기간 무선 연동 인터랙티브 데모</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            모바일에서 찰칵 찍으면, <br />
            PC 모니터에 1초 만에 사진대지가 완성됩니다.
          </h2>
          <p className="mt-3 text-xs sm:text-base text-slate-600 font-medium leading-relaxed">
            오른쪽 스마트폰에서 <strong>[카메라 촬영]</strong> 또는 <strong>[샘플 균열 사진]</strong>을 눌러보세요. <br className="hidden sm:inline" />
            왼쪽 PC 관리자 콘솔과 A4 사진대지에 실시간으로 조판되는 것을 바로 확인하실 수 있습니다.
          </p>

          {/* 스마트폰 QR 연동 CTA 배너 버튼 */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setQrModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-slate-900/20 transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>내 스마트폰으로 직접 사진 찍어보기 (QR 연동)</span>
            </button>
            <a
              href={`/?mode=remote&site=${selectedSiteId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>새 창에서 모바일 전용 뷰 열기</span>
            </a>
          </div>
        </div>

        {/* 모바일 기기 접속자를 위한 직관적인 뷰 스위처 (작은 화면에서 표시) */}
        <div className="lg:hidden mb-6 bg-slate-200/80 p-1.5 rounded-2xl flex items-center shadow-inner">
          <button
            onClick={() => setMobileViewTab("mobile")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileViewTab === "mobile"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. 스마트폰 현장 점검 (사진 촬영)</span>
          </button>
          <button
            onClick={() => setMobileViewTab("admin")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileViewTab === "admin"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <MonitorCheck className="w-4 h-4 text-emerald-400" />
            <span>2. PC 사진대지 (실시간 결과)</span>
          </button>
        </div>

        {/* 실시간 동기화 알림 플로팅 배너 */}
        {syncBannerMessage && (
          <div className="mb-6 p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>{syncBannerMessage}</span>
            </div>
            <span className="text-[11px] bg-emerald-700/80 px-2 py-0.5 rounded font-mono shrink-0">
              0.1s 동기화
            </span>
          </div>
        )}

        {/* 듀얼 인터페이스 컨테이너 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* 1. 좌측: PC 관리자 대시보드 (7 컬럼) */}
          {/* ========================================================= */}
          <div
            className={`lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col transition-all ${
              mobileViewTab === "admin" ? "block" : "hidden lg:flex"
            }`}
          >
            {/* PC 브라우저 탑바 목업 */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="text-xs font-bold text-slate-300 ml-2">
                  체크리포트 PC 콘솔 — {currentSite.siteName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>실시간 동기화 ON</span>
                </span>
              </div>
            </div>

            {/* 현장 선택 바 */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-slate-600">점검 현장 전환:</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                  {currentSite.category}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSiteId(s.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      s.id === selectedSiteId
                        ? "bg-[#2563EB] text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {s.siteName}
                  </button>
                ))}
              </div>
            </div>

            {/* 현장 요약 메타 정보 카드 */}
            <div className="p-4 sm:p-5 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-semibold block">총 점검 항목</span>
                <span className="text-base sm:text-lg font-black text-slate-900">{currentSite.totalItems}건</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-semibold block">적합(완료)</span>
                <span className="text-base sm:text-lg font-black text-emerald-800">{currentSite.completedItems}건</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                <span className="text-[11px] text-rose-700 font-semibold block">미조치(불합격)</span>
                <span className="text-base sm:text-lg font-black text-rose-700">{currentSite.failedItems}건</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <span className="text-[11px] text-blue-700 font-semibold block">점검 진행률</span>
                <span className="text-base sm:text-lg font-black text-blue-700">{currentSite.progressPercent}%</span>
              </div>
            </div>

            {/* PC 콘솔 내부 탭 */}
            <div className="flex border-b border-slate-200 px-4 sm:px-5 bg-white text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveAdminTab("items")}
                className={`py-3 px-3 border-b-2 cursor-pointer transition-colors ${
                  activeAdminTab === "items"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                1. 점검표 및 실시간 현황
              </button>
              <button
                onClick={() => setActiveAdminTab("defects")}
                className={`py-3 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeAdminTab === "defects"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <span>2. 미조치 지적 관리</span>
                {currentSite.failedItems > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {currentSite.failedItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveAdminTab("report")}
                className={`py-3 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeAdminTab === "report"
                    ? "border-blue-600 text-blue-600 font-black"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>3. 완성된 A4 사진대지</span>
              </button>
            </div>

            {/* PC 탭 콘텐츠 영역 */}
            <div className="p-4 sm:p-5 flex-1 min-h-[420px] bg-slate-50/30 overflow-y-auto">
              {/* 탭 1: 점검표 항목 리스트 */}
              {activeAdminTab === "items" && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 font-medium pb-1 flex justify-between items-center">
                    <span>{currentSite.templateTitle}</span>
                    <span className="text-blue-600 font-bold flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                      <span>모바일 변경 시 즉시 갱신</span>
                    </span>
                  </div>
                  {currentSite.items.map((item) => {
                    const isJustSynced = lastSyncedItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 shadow-2xs ${
                          isJustSynced
                            ? "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-400"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.photoBefore ? (
                              <div className="relative group">
                                <img
                                  src={item.photoBefore}
                                  alt="현장사진"
                                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs"
                                />
                                <span className="absolute bottom-0 left-0 text-[8px] bg-slate-900/80 text-white px-1.5 py-0.2 rounded-bl-xl font-bold">
                                  Before
                                </span>
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-slate-200/80 text-[10px]">
                                <Camera className="w-5 h-5 mb-0.5" />
                                <span>미등록</span>
                              </div>
                            )}
                            {item.photoAfter && (
                              <div className="relative">
                                <img
                                  src={item.photoAfter}
                                  alt="조치후사진"
                                  className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-500 shadow-2xs"
                                />
                                <span className="absolute bottom-0 left-0 text-[8px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-bl-xl font-bold">
                                  After
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {item.category}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {item.title}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              기준: {item.standard}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {item.status === "pass" && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> 적합
                            </span>
                          )}
                          {item.status === "fail" && (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> 부적합
                            </span>
                          )}
                          {item.status === "pending" && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs">
                              미점검
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 탭 2: 미조치 항목 관리 */}
              {activeAdminTab === "defects" && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                    ⚠️ 불합격 판정된 항목은 현장 조치 완료 사진이 등록될 때까지 조치 기한(D-Day)을 실시간 추적합니다.
                  </div>
                  {defectItems.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-medium">
                      현재 미조치 지적 항목이 없습니다. (모든 항목 적합)
                    </div>
                  ) : (
                    defectItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-rose-200 bg-white shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                            지적사항 No.{item.id}
                          </span>
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                            기한: {item.actionDeadline || "금일 18:00"}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-slate-400">불량 위치:</span>{" "}
                            <strong className="text-slate-800">{item.defectLocation || "미입력"}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">조치 지시:</span>{" "}
                            <strong className="text-slate-800">{item.actionNotes || "현장 보수 요망"}</strong>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 탭 3: 완성된 A4 사진대지 보고서 */}
              {activeAdminTab === "report" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        {currentSite.templateTitle} - A4 2단 표준 사진대지
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        스마트폰에서 찍은 사진이 자동으로 배치되어 즉시 PDF 인쇄가 가능합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => printInspectionReport(currentSite)}
                      className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>실제 PDF 인쇄</span>
                    </button>
                  </div>

                  {/* A4 미리보기 시트 */}
                  <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm text-xs font-sans space-y-3">
                    <div className="text-center pb-2 border-b-2 border-slate-800">
                      <span className="text-xs text-slate-400 font-bold block">공사 감리 / 현장 안전 점검</span>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">현 장 사 진 대 지</h3>
                      <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                        <span>현장명: <strong>{currentSite.siteName}</strong></span>
                        <span>담당: <strong>{currentSite.managerName}</strong></span>
                        <span>일자: <strong>{currentSite.scheduledDate}</strong></span>
                      </div>
                    </div>

                    {/* 사진대지 그리드 (2열) */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {currentSite.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="border border-slate-300 rounded-lg p-2 space-y-1.5">
                          <div className="aspect-4/3 bg-slate-100 rounded overflow-hidden border border-slate-200 flex items-center justify-center">
                            {item.photoBefore ? (
                              <img src={item.photoBefore} alt="사진" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-slate-400">사진 미등록</span>
                            )}
                          </div>
                          <div className="text-[10px] font-bold text-slate-800 truncate">{item.title}</div>
                          <div className="text-[9px] text-slate-500 flex justify-between">
                            <span>{item.category}</span>
                            <span className={item.status === "pass" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                              {item.status === "pass" ? "적합" : item.status === "fail" ? "부적합" : "미점검"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. 우측: 스마트폰 점검 시뮬레이터 (5 컬럼) */}
          {/* ========================================================= */}
          <div
            className={`lg:col-span-5 flex flex-col items-center transition-all ${
              mobileViewTab === "mobile" ? "block w-full" : "hidden lg:flex"
            }`}
          >
            {/* 스마트폰 프레임 (데스크톱에서는 아이폰 목업, 모바일 접속 시에는 풀스크린 카드) */}
            <div className="w-full sm:w-[380px] bg-slate-900 sm:rounded-[44px] sm:p-3 sm:shadow-2xl sm:border-4 sm:border-slate-800 relative rounded-3xl p-1 shadow-lg">
              {/* 상단 다이나믹 아일랜드 (데스크톱 목업 전용) */}
              <div className="hidden sm:block absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30" />

              {/* 스마트폰 내부 액정 화면 */}
              <div className="bg-white rounded-2xl sm:rounded-[36px] overflow-hidden flex flex-col h-[660px] text-slate-900 font-sans relative">
                {/* 스마트폰 앱 상단 바 */}
                <div className="bg-[#2563EB] text-white pt-5 sm:pt-8 pb-3.5 px-4 shrink-0 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] mb-1 opacity-90 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>PC 연결됨</span>
                    </span>
                    <button
                      onClick={() => setQrModalOpen(true)}
                      className="text-[10px] bg-blue-700 hover:bg-blue-800 text-white px-2 py-0.5 rounded font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3 text-emerald-300" />
                      <span>진짜 스마트폰으로 해보기</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-800 text-blue-200">
                        모바일 현장점검
                      </span>
                      <h3 className="text-sm font-bold truncate max-w-[200px] mt-0.5">
                        {currentSite.siteName}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black">{currentSite.progressPercent}%</span>
                      <span className="block text-[9px] text-blue-200">
                        {currentSite.completedItems}/{currentSite.totalItems} 완료
                      </span>
                    </div>
                  </div>
                </div>

                {/* 스마트폰 스크롤 체크리스트 영역 */}
                <div className="p-3.5 flex-1 overflow-y-auto space-y-3 bg-[#F8FAFC]">
                  <div className="text-[11px] text-slate-500 font-medium px-1 flex items-center justify-between">
                    <span>항목을 탭하여 사진 촬영 및 판정을 변경해보세요:</span>
                  </div>

                  {currentSite.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            No.{idx + 1} · {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.standard}</p>
                        </div>
                      </div>

                      {/* 사진 미리보기 및 촬영 섹션 */}
                      <div className="space-y-1.5">
                        {item.photoBefore ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                            <img src={item.photoBefore} alt="현장" className="w-full h-28 object-cover" />
                            <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
                              GPS 인증됨
                            </span>
                            <label className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white text-[9px] font-bold px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 transition-colors">
                              <Camera className="w-3 h-3" />
                              <span>사진 다시 찍기</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => handlePhotoUpload(item.id, "before", e)}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {/* 큰 카메라 촬영 버튼 */}
                            <label className="w-full py-3 bg-blue-50/70 hover:bg-blue-100/70 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center gap-2 text-blue-700 cursor-pointer transition-colors active:scale-98">
                              <Camera className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-black">현장 사진 촬영하기 (클릭)</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => handlePhotoUpload(item.id, "before", e)}
                              />
                            </label>

                            {/* 💡 1초 테스트: 샘플 사진 넣기 버튼 */}
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <span className="shrink-0 font-bold">1초 테스트:</span>
                              <button
                                type="button"
                                onClick={() => handleInjectSamplePhoto(item.id, SAMPLE_PHOTOS[0].url, "옹벽 균열")}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 font-bold transition-colors"
                              >
                                🧱 균열 사진
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInjectSamplePhoto(item.id, SAMPLE_PHOTOS[1].url, "배관 누수")}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 font-bold transition-colors"
                              >
                                💧 누수 사진
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 불합격 시 조치 후(After) 사진 추가 섹션 */}
                        {item.status === "fail" && (
                          <div className="pt-1">
                            {item.photoAfter ? (
                              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500">
                                <img src={item.photoAfter} alt="조치후" className="w-full h-24 object-cover" />
                                <span className="absolute bottom-1 left-1 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                                  ✓ 조치 완료 (After)
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <label className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors">
                                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>+ 보수 완료 사진(After) 촬영</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(item.id, "after", e)}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleInjectSamplePhoto(item.id, SAMPLE_PHOTOS[3].url, "보수 완료(After)")}
                                  className="w-full text-center text-[10px] text-emerald-700 bg-emerald-100/50 hover:bg-emerald-100 py-1 rounded font-bold transition-colors"
                                >
                                  ✨ 1초 테스트: 보수 완료 샘플 사진 넣기
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 판정 토글 버튼 (합격/불합격/해당없음) */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => handleToggleStatus(item.id, "pass")}
                          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                            item.status === "pass"
                              ? "bg-emerald-600 text-white shadow-2xs font-black"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>합격</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item.id, "fail")}
                          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                            item.status === "fail"
                              ? "bg-rose-600 text-white shadow-2xs font-black"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>불합격</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item.id, "na")}
                          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                            item.status === "na"
                              ? "bg-slate-700 text-white font-black"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <span>N/A</span>
                        </button>
                      </div>

                      {item.status === "fail" && (
                        <div className="p-2 rounded-lg bg-rose-50 text-[10px] text-rose-800 space-y-0.5 border border-rose-100">
                          <div>📍 <strong>불량 위치:</strong> {item.defectLocation || "지하 2층 옹벽"}</div>
                          <div>✍️ <strong>조치 지시:</strong> {item.actionNotes || "보수 후 사진 등록 필요"}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 모바일 하단 제출 버튼 바 */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                  <button
                    onClick={handleMobileSubmit}
                    disabled={isSubmittingMobile}
                    className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    {isSubmittingMobile ? (
                      <span>PC 클라우드로 동기화 중...</span>
                    ) : mobileSubmitted ? (
                      <span className="text-emerald-300 flex items-center gap-1">
                        <Check className="w-4 h-4" /> PC 사진대지 생성 완료!
                      </span>
                    ) : (
                      <span>전자서명 및 점검 완료 (PC 동기화)</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <span className="text-xs text-slate-400 mt-3 font-semibold text-center">
              💡 오른쪽에서 사진을 등록하면 왼쪽 PC 콘솔에 즉시 나타납니다.
            </span>
          </div>
        </div>

        {/* 스마트폰 QR 연동 모달 */}
        <RemoteQrModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          siteId={selectedSiteId}
          siteName={currentSite.siteName}
        />
      </div>
    </section>
  );
}
