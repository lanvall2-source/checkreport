import React, { useState, useEffect } from "react";
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
  Clock,
  Filter,
  Download,
  Plus,
} from "lucide-react";
import { DEMO_SITES } from "@/lib/constants";
import { compressImage } from "@/lib/imageCompressor";
import { printInspectionReport } from "./ReportPrintModal";
import { RemoteQrModal } from "./RemoteQrModal";
import { SiteBuilderModal } from "./SiteBuilderModal";
import type { InspectionSite, CheckItem, InspectionStatus, UserSession } from "@/types";

interface DualInspectionDemoProps {
  userSession?: UserSession | null;
}

export function DualInspectionDemo({ userSession }: DualInspectionDemoProps = {}) {
  // 점검 현장 상태 (로컬 스토리지 또는 DEMO_SITES)
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
  const [activeTab, setActiveTab] = useState<"items" | "defects" | "report">("items");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [builderModalOpen, setBuilderModalOpen] = useState(false);

  // 새 현장 생성 처리
  const handleCreateSite = async (newSite: InspectionSite) => {
    const updatedSites = [newSite, ...sites];
    setSites(updatedSites);
    setSelectedSiteId(newSite.id);
    setActiveTab("items");
    setBuilderModalOpen(false);

    try {
      localStorage.setItem("checkreport_sites", JSON.stringify(updatedSites));
    } catch {
      // ignore
    }

    // 서버리스 클라우드 즉시 동기화 등록
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: newSite.id,
          data: updatedSites,
          sender: "pc-admin-create",
        }),
      });

      // 동일 기기 다른 탭 즉시 동기화
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("checkreport_sync_channel");
        bc.postMessage({ type: "UPDATE_SITES", sites: updatedSites });
        bc.close();
      }
    } catch {
      // ignore
    }

    setSyncToast(`새 현장 '${newSite.siteName}'이 등록되었습니다. 모바일에서 바로 점검할 수 있습니다.`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  // 동기화 상태: 5분 주기 + 수동 새로고침
  const [lastSyncTime, setLastSyncTime] = useState<string>("방금 전");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

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

  // 서버에서 최신 데이터 1회 불러오기 함수
  const fetchLatestSync = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/sync?roomId=${selectedSiteId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.exists && json.data) {
          setSites(json.data);
          try {
            localStorage.setItem("checkreport_sites", JSON.stringify(json.data));
          } catch {
            // ignore
          }
        }
      }
      const now = new Date();
      setLastSyncTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`);
      if (!silent) {
        setSyncToast("클라우드 현장 데이터 동기화 완료");
        setTimeout(() => setSyncToast(null), 2500);
      }
    } catch {
      // ignore
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // 실시간 동기화: 5분(300,000ms) 주기 자동 폴링 & BroadcastChannel 리스너
  useEffect(() => {
    // 1. BroadcastChannel (같은 브라우저 탭 간 즉시 수신)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("checkreport_sync_channel");
        bc.onmessage = (event) => {
          if (event.data?.type === "UPDATE_SITES" && event.data.sites) {
            setSites(event.data.sites);
            setSyncToast("모바일에서 새 현장 사진 및 점검이 등록되었습니다.");
            setTimeout(() => setSyncToast(null), 3000);
          }
        };
      }
    } catch {
      // ignore
    }

    // 2. 서버리스 5분 주기 자동 폴링 (현장 업무에 최적화된 5분 주기)
    const interval = setInterval(() => {
      fetchLatestSync(true);
    }, 5 * 60 * 1000); // 5분

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [selectedSiteId]);

  // 사진 업로드 (PC 콘솔에서 직접 업로드 시에도 1024px 스마트 압축 적용)
  const handlePhotoUpload = async (itemId: string, type: "before" | "after", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressResult = await compressImage(file, 1024, 1024, 0.75);
      const dataUrl = compressResult.dataUrl;

      const updatedSites = sites.map((site) => {
        if (site.id !== selectedSiteId) return site;
        const updatedItems = site.items.map((it) => {
          if (it.id !== itemId) return it;
          return type === "before"
            ? { ...it, photoBefore: dataUrl }
            : { ...it, photoAfter: dataUrl, actionStatus: "resolved" as const };
        });
        return { ...site, items: updatedItems };
      });

      setSites(updatedSites);
      localStorage.setItem("checkreport_sites", JSON.stringify(updatedSites));

      // 서버 동기화
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedSiteId,
          data: updatedSites,
          sender: "pc-admin",
        }),
      });

      setSyncToast("사진이 등록되어 보고서에 반영되었습니다.");
      setTimeout(() => setSyncToast(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const defectItems = currentSite.items.filter((i) => i.status === "fail");

  return (
    <section id="demo" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 섹션 제목 및 헤더 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>현장 점검 관리자 콘솔</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              PC 관리자 와이드 대시보드
            </h2>
            <p className="mt-2 text-xs sm:text-base text-slate-600 font-medium">
              모바일에서 전송된 현장 사진이 집계되며, A4 2단 사진대지 보고서로 즉시 출력됩니다.
            </p>
          </div>

          {/* 우측 퀵 액션 버튼 바 */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 새 현장 등록 & 점검표 빌더 버튼 */}
            <button
              onClick={() => setBuilderModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>새 현장 등록 / 점검표 빌더</span>
            </button>

            {/* 수동 동기화 버튼 (5분 주기 안내) */}
            <button
              onClick={() => fetchLatestSync(false)}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="클라우드 현장 데이터 새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>동기화 ({lastSyncTime})</span>
            </button>

            {/* 스마트폰 QR 연동 모달 */}
            <button
              onClick={() => setQrModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>스마트폰 QR 연결</span>
            </button>

            {/* 모바일 점검 전용 뷰 열기 */}
            <a
              href={`/?mode=remote&site=${selectedSiteId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>모바일 점검기 열기</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* 동기화 알림 배너 */}
        {syncToast && (
          <div className="mb-6 p-3 bg-emerald-600 text-white rounded-2xl shadow-md flex items-center justify-between px-5 text-xs font-bold animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{syncToast}</span>
            </div>
            <span className="text-[11px] opacity-80 font-normal">5분 주기 자동 백그라운드 동기화</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* PC 와이드 통합 관리자 콘솔 (12 컬럼 전체 활용) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
          {/* 상단 브라우저 바 */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-200 ml-1">
                체크리포트 통합 현장 관리자 콘솔 — {currentSite.siteName}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>동기화 주기: 5분</span>
              </span>
              <button
                onClick={() => printInspectionReport(currentSite)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>A4 사진대지 인쇄 / PDF</span>
              </button>
            </div>
          </div>

          {/* 현장 선택 및 메타 지표 바 */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-500 shrink-0">점검 현장:</span>
              {sites.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSiteId(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    s.id === selectedSiteId
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {s.siteName}
                </button>
              ))}

              <button
                onClick={() => setBuilderModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 bg-blue-50 border border-dashed border-blue-300 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-1 cursor-pointer"
                title="직접 새 현장 만들기"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 현장 추가</span>
              </button>
            </div>

            {/* 4대 주요 지표 */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="text-slate-400 font-medium">총 항목: </span>
                <strong className="text-slate-900">{currentSite.totalItems}건</strong>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <span className="text-emerald-700 font-medium">적합: </span>
                <strong className="text-emerald-900">{currentSite.completedItems}건</strong>
              </div>
              <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs">
                <span className="text-rose-700 font-medium">지적(미조치): </span>
                <strong className="text-rose-900">{currentSite.failedItems}건</strong>
              </div>
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                <span className="text-blue-700 font-medium">진행률: </span>
                <strong className="text-blue-900">{currentSite.progressPercent}%</strong>
              </div>
            </div>
          </div>

          {/* 3대 메인 탭 */}
          <div className="flex border-b border-slate-200 px-6 bg-white text-xs sm:text-sm font-bold text-slate-600 gap-2">
            <button
              onClick={() => setActiveTab("items")}
              className={`py-3.5 px-4 border-b-2 cursor-pointer transition-colors ${
                activeTab === "items"
                  ? "border-blue-600 text-blue-600 font-black"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              1. 전체 점검 항목 및 사진 현황 ({currentSite.items.length})
            </button>
            <button
              onClick={() => setActiveTab("defects")}
              className={`py-3.5 px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                activeTab === "defects"
                  ? "border-blue-600 text-blue-600 font-black"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <span>2. 지적 결함 및 보수 조치 추적</span>
              {currentSite.failedItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] flex items-center justify-center font-bold">
                  {currentSite.failedItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`py-3.5 px-4 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                activeTab === "report"
                  ? "border-blue-600 text-blue-600 font-black"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>3. A4 2단 사진대지 보고서 미리보기</span>
            </button>
          </div>

          {/* 탭 콘텐츠 영역 */}
          <div className="p-6 bg-slate-50/40 min-h-[500px]">
            {/* ========================================================= */}
            {/* 탭 1: 전체 점검 항목 및 사진 테이블 (넓은 화면 최적화) */}
            {/* ========================================================= */}
            {activeTab === "items" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>점검표: <strong>{currentSite.templateTitle}</strong></span>
                  <span>모바일에서 촬영한 사진이 자동으로 아래 표에 등록됩니다.</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 w-28">구분</th>
                        <th className="py-3 px-4 min-w-[200px]">점검 항목 및 기준</th>
                        <th className="py-3 px-4 w-36 text-center">현장 사진 (Before)</th>
                        <th className="py-3 px-4 w-36 text-center">조치 사진 (After)</th>
                        <th className="py-3 px-4 w-24 text-center">판정</th>
                        <th className="py-3 px-4 w-28 text-center">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentSite.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              기준: {item.standard}
                            </div>
                            {item.defectLocation && (
                              <div className="text-[10px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>위치: {item.defectLocation}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {item.photoBefore ? (
                              <div className="relative group inline-block">
                                <img
                                  src={item.photoBefore}
                                  alt="현장사진"
                                  className="w-20 h-14 rounded-lg object-cover border border-slate-200 shadow-2xs mx-auto"
                                />
                                <label className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                  <span>변경</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(item.id, "before", e)}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="w-20 h-14 rounded-lg border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors mx-auto text-[10px]">
                                <Camera className="w-4 h-4 mb-0.5" />
                                <span>등록</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(item.id, "before", e)}
                                />
                              </label>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {item.photoAfter ? (
                              <div className="relative group inline-block">
                                <img
                                  src={item.photoAfter}
                                  alt="조치사진"
                                  className="w-20 h-14 rounded-lg object-cover border-2 border-emerald-500 shadow-2xs mx-auto"
                                />
                                <span className="absolute bottom-0 left-0 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-bl-lg">
                                  완료
                                </span>
                              </div>
                            ) : item.status === "fail" ? (
                              <label className="w-20 h-14 rounded-lg border border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 flex flex-col items-center justify-center text-emerald-700 cursor-pointer transition-colors mx-auto text-[10px] font-bold">
                                <Camera className="w-4 h-4 mb-0.5 text-emerald-600" />
                                <span>+ 조치후</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(item.id, "after", e)}
                                />
                              </label>
                            ) : (
                              <span className="text-[11px] text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {item.status === "pass" && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> 적합
                              </span>
                            )}
                            {item.status === "fail" && (
                              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> 불합격
                              </span>
                            )}
                            {item.status === "pending" && (
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs">
                                미점검
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-slate-400 text-[11px]">
                              {item.photoBefore ? "사진 등록됨" : "사진 대기"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 탭 2: 지적 결함 및 보수 조치 추적 (넓은 화면 최적화) */}
            {/* ========================================================= */}
            {activeTab === "defects" && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      현장에서 불합격 판정된 항목은 보수 조치 후 사진이 등록될 때까지 조치 기한(D-Day)을 추적 관리합니다.
                    </span>
                  </div>
                  <span className="text-amber-800 font-bold">총 {defectItems.length}건 관리 중</span>
                </div>

                {defectItems.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-slate-700">현재 미조치 지적 항목이 없습니다.</p>
                    <p className="text-xs text-slate-400 mt-1">모든 점검 항목이 적합 판정되었거나 조치 완료되었습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defectItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl border border-rose-200 bg-white shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                            지적사항 No.{item.id} · {item.category}
                          </span>
                          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-md">
                            조치 기한: {item.actionDeadline || "금일 18:00"}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-900">{item.title}</h4>

                        {/* 조치 전/후 사진 비교 박스 */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">
                              조치 전 현장 사진 (Before)
                            </span>
                            {item.photoBefore ? (
                              <img
                                src={item.photoBefore}
                                alt="조치전"
                                className="w-full h-28 object-cover rounded-lg border border-slate-200"
                              />
                            ) : (
                              <div className="w-full h-28 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                                사진 없음
                              </div>
                            )}
                          </div>

                          <div className="border border-emerald-200 rounded-xl p-2 bg-emerald-50/40 text-center">
                            <span className="text-[10px] font-bold text-emerald-800 block mb-1">
                              보수 완료 사진 (After)
                            </span>
                            {item.photoAfter ? (
                              <img
                                src={item.photoAfter}
                                alt="조치후"
                                className="w-full h-28 object-cover rounded-lg border-2 border-emerald-500"
                              />
                            ) : (
                              <label className="w-full h-28 border border-dashed border-emerald-300 rounded-lg flex flex-col items-center justify-center text-emerald-700 bg-white hover:bg-emerald-50/50 cursor-pointer transition-colors text-xs font-bold">
                                <Camera className="w-4 h-4 mb-1 text-emerald-600" />
                                <span>완료 사진 등록</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(item.id, "after", e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700 border border-slate-200/80">
                          <div>📍 <strong>불량 위치:</strong> {item.defectLocation || "미입력"}</div>
                          <div>✍️ <strong>조치 지시:</strong> {item.actionNotes || "현장 보수 요망"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 탭 3: A4 2단 표준 사진대지 보고서 미리보기 (인쇄 규격) */}
            {/* ========================================================= */}
            {activeTab === "report" && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {currentSite.templateTitle} — 국토부/공문 규격 A4 2단 사진대지
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      현장에서 등록된 사진이 2단 격자로 자동 배치되며 결재란과 함께 PDF로 즉시 인쇄됩니다.
                    </p>
                  </div>
                  <button
                    onClick={() => printInspectionReport(currentSite)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
                  >
                    <Printer className="w-4 h-4" />
                    <span>실제 A4 PDF 인쇄하기</span>
                  </button>
                </div>

                {/* 실제 A4 사진대지 프리뷰 시트 */}
                <div className="bg-white border-2 border-slate-400 rounded-2xl p-6 sm:p-8 shadow-md text-xs font-sans space-y-4">
                  {/* 표지 헤더 및 결재란 */}
                  <div className="border-b-2 border-slate-900 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-500 block mb-0.5">
                          공사 감리 및 안전 점검 보고서
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          현 장 사 진 대 지
                        </h2>
                      </div>

                      {/* 3단 결재란 */}
                      <table className="border border-slate-400 text-center text-[10px]">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-400 px-3 py-1 font-bold">담당자</th>
                            <th className="border border-slate-400 px-3 py-1 font-bold">감리원</th>
                            <th className="border border-slate-400 px-3 py-1 font-bold">현장소장</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="h-10">
                            <td className="border border-slate-400 px-3 text-slate-400">(서명)</td>
                            <td className="border border-slate-400 px-3 text-slate-400">(인)</td>
                            <td className="border border-slate-400 px-3 text-slate-400">(인)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-700 mt-3 pt-3 border-t border-slate-200">
                      <div>공사명: <strong>{currentSite.siteName}</strong></div>
                      <div>담당: <strong>{currentSite.managerName}</strong></div>
                      <div>점검일자: <strong>{currentSite.scheduledDate}</strong></div>
                    </div>
                  </div>

                  {/* 사진대지 그리드 (A4 표준 2열 배치) */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {currentSite.items.map((item, idx) => (
                      <div key={item.id} className="border border-slate-300 rounded-xl p-3 space-y-2 bg-slate-50/50">
                        <div className="aspect-4/3 bg-slate-200/80 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center">
                          {item.photoBefore ? (
                            <img src={item.photoBefore} alt="현장" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">사진 미등록</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-500">No.{idx + 1} [{item.category}]</span>
                            <span className={item.status === "pass" ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                              {item.status === "pass" ? "✓ 적합" : item.status === "fail" ? "✗ 불합격" : "미점검"}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-slate-900 leading-snug truncate">
                            {item.title}
                          </div>
                          {item.defectLocation && (
                            <div className="text-[10px] text-slate-600 truncate">
                              위치: {item.defectLocation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 스마트폰 QR 연동 모달 */}
        <RemoteQrModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          siteId={selectedSiteId}
          siteName={currentSite.siteName}
        />

        {/* 새 점검 현장 등록 & 점검표 빌더 모달 */}
        <SiteBuilderModal
          isOpen={builderModalOpen}
          onClose={() => setBuilderModalOpen(false)}
          onCreated={handleCreateSite}
          defaultCompanyName={userSession?.companyName}
          defaultManagerName={userSession?.managerName}
        />
      </div>
    </section>
  );
}
