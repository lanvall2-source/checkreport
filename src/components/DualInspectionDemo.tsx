import React, { useState } from "react";
import {
  MonitorCheck,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Download,
  Calendar,
  User,
  MapPin,
  Camera,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  FileCheck2,
  Eye,
} from "lucide-react";
import { DEMO_SITES } from "@/lib/constants";
import { printInspectionReport } from "./ReportPrintModal";
import type { InspectionSite, CheckItem, InspectionStatus } from "@/types";

export function DualInspectionDemo() {
  const [sites, setSites] = useState<InspectionSite[]>(DEMO_SITES);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("SITE-2026-001");
  const [activeAdminTab, setActiveAdminTab] = useState<"items" | "defects" | "report">("items");
  const [isSubmittingMobile, setIsSubmittingMobile] = useState<boolean>(false);
  const [mobileSubmitted, setMobileSubmitted] = useState<boolean>(false);

  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // 모바일 점검 항목 상태 토글
  const handleToggleStatus = (itemId: string, newStatus: InspectionStatus) => {
    setSites((prevSites) =>
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
      })
    );
  };

  // 모바일 점검 완료 제출
  const handleMobileSubmit = () => {
    setIsSubmittingMobile(true);
    setTimeout(() => {
      setIsSubmittingMobile(false);
      setMobileSubmitted(true);
      setTimeout(() => setMobileSubmitted(false), 3000);
    }, 800);
  };

  const defectItems = currentSite.items.filter((i) => i.status === "fail");

  return (
    <section id="demo" className="py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 섹션 제목 */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>PC 관리자 & 모바일 듀얼 인터랙티브 데모</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            PC에서 점검표를 만들고, <br />
            모바일에서 찰칵하면 끝납니다.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
            우측 스마트폰 화면의 체크박스를 직접 터치해 보세요. 좌측 관리자 대시보드와 보고서에 실시간으로 반영됩니다.
          </p>
        </div>

        {/* 듀얼 인터페이스 컨테이너 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* 1. 좌측: PC 관리자 대시보드 (7 컬럼) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            {/* PC 브라우저 탑바 목업 */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="text-xs font-bold text-slate-300 ml-2 hidden sm:inline">
                  체크리포트 PC 관리자 콘솔 — {currentSite.siteName}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                실시간 동기화 ON
              </span>
            </div>

            {/* 현장 선택 탭 */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-500">점검 현장 선택:</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
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
            <div className="p-5 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-semibold block">총 점검 항목</span>
                <span className="text-lg font-black text-slate-900">{currentSite.totalItems}건</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-semibold block">적합(완료)</span>
                <span className="text-lg font-black text-emerald-800">{currentSite.completedItems}건</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="text-[11px] text-rose-700 font-semibold block">미조치(불합격)</span>
                <span className="text-lg font-black text-rose-700">{currentSite.failedItems}건</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[11px] text-blue-700 font-semibold block">점검 진행률</span>
                <span className="text-lg font-black text-blue-700">{currentSite.progressPercent}%</span>
              </div>
            </div>

            {/* PC 콘솔 내부 탭 */}
            <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveAdminTab("items")}
                className={`py-3 px-3 border-b-2 cursor-pointer transition-colors ${
                  activeAdminTab === "items"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                1. 점검표 및 결과 현황
              </button>
              <button
                onClick={() => setActiveAdminTab("defects")}
                className={`py-3 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeAdminTab === "defects"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <span>2. 미조치 항목 관리</span>
                {currentSite.failedItems > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {currentSite.failedItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveAdminTab("report")}
                className={`py-3 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1 ${
                  activeAdminTab === "report"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <span>3. A4 사진대지 보고서</span>
              </button>
            </div>

            {/* PC 탭 콘텐츠 영역 */}
            <div className="p-5 flex-1 min-h-[380px] bg-slate-50/30 overflow-y-auto">
              {/* 탭 1: 점검표 항목 리스트 */}
              {activeAdminTab === "items" && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 font-medium pb-1 flex justify-between items-center">
                    <span>{currentSite.templateTitle}</span>
                    <span className="text-blue-600 font-bold">우측 스마트폰에서 변경 시 즉시 갱신</span>
                  </div>
                  {currentSite.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        {item.photoBefore ? (
                          <img
                            src={item.photoBefore}
                            alt="현장사진"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{item.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs sm:max-w-md">
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
                  ))}
                </div>
              )}

              {/* 탭 2: 미조치 항목 관리 */}
              {activeAdminTab === "defects" && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                    ⚠️ 불합격 판정된 항목은 현장 조치 완료 사진이 등록될 때까지 조치 기한(D-Day)을 추적 관리합니다.
                  </div>
                  {defectItems.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-medium">
                      현재 미조치 지적 항목이 없습니다. (모든 항목 적합)
                    </div>
                  ) : (
                    defectItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-rose-200 bg-white shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            지적사항 No.{item.id}
                          </span>
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            기한: {item.actionDeadline || "금일 18:00"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <div className="text-[11px] text-slate-600">
                          <strong>불량 위치:</strong> {item.defectLocation || "위치 미기재"}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <strong>조치 지시:</strong> {item.actionNotes || "즉시 보수 요망"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 탭 3: 보고서 출력 */}
              {activeAdminTab === "report" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">공문 및 감리 제출용 정기 보고서</h4>
                      <p className="text-[11px] text-slate-500">모바일에서 촬영한 사진이 A4 사진 대지 2단 규격으로 자동 배치되었습니다.</p>
                    </div>
                    <button
                      onClick={() => printInspectionReport(currentSite)}
                      className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>A4 보고서 인쇄 / PDF 출력</span>
                    </button>
                  </div>

                  {/* A4 미리보기 축소판 */}
                  <div className="bg-white border-2 border-slate-300 rounded-xl p-4 text-[11px] space-y-3 font-sans shadow-inner">
                    <div className="text-center pb-2 border-b-2 border-slate-800">
                      <span className="text-[10px] text-slate-400 block">[체크리포트 클라우드 공문 규격]</span>
                      <strong className="text-sm font-bold text-slate-900">{currentSite.siteName} 점검 결과표</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded">
                      <div>일자: {new Date().toLocaleDateString("ko-KR")}</div>
                      <div>점검자: {currentSite.managerName}</div>
                      <div>현장: {currentSite.address}</div>
                      <div>판정: 적합 {currentSite.completedItems}건 / 부적합 {currentSite.failedItems}건</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {currentSite.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="border border-slate-200 rounded p-1.5">
                          <img src={item.photoBefore} className="w-full h-20 object-cover rounded mb-1" alt="" />
                          <div className="font-bold text-[10px] truncate">{item.title}</div>
                          <div className="text-[9px] text-slate-500">{item.defectLocation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. 우측: 모바일 스마트폰 점검 시뮬레이터 (5 컬럼) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* 스마트폰 외곽 프레임 */}
            <div className="w-[320px] sm:w-[360px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* 상단 다이나믹 아일랜드 / 카메라 노치 */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30" />

              {/* 스마트폰 액정 스크린 */}
              <div className="bg-white rounded-[36px] overflow-hidden flex flex-col h-[640px] text-slate-900 font-sans relative">
                {/* 모바일 상단 바 */}
                <div className="bg-[#2563EB] text-white pt-8 pb-3.5 px-4 shrink-0 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] mb-1 opacity-90 font-mono">
                    <span>9:41 AM</span>
                    <span>LTE 100%</span>
                  </div>
                  <div className="flex items-center justify-between">
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
                      <span className="block text-[9px] text-blue-200">진행률</span>
                    </div>
                  </div>
                </div>

                {/* 모바일 체크리스트 스크롤 영역 */}
                <div className="p-3.5 flex-1 overflow-y-auto space-y-3 bg-[#F8FAFC]">
                  <div className="text-[11px] text-slate-500 font-medium px-1">
                    항목을 탭하여 판정(합격/불합격)을 변경해보세요:
                  </div>

                  {currentSite.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.standard}</p>
                        </div>
                      </div>

                      {/* 사진 미리보기 */}
                      {item.photoBefore && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200">
                          <img src={item.photoBefore} alt="현장" className="w-full h-24 object-cover" />
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
                            GPS 인증됨
                          </span>
                        </div>
                      )}

                      {/* 판정 토글 버튼 (합격/불합격/해당없음) */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => handleToggleStatus(item.id, "pass")}
                          className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            item.status === "pass"
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>합격</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item.id, "fail")}
                          className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            item.status === "fail"
                              ? "bg-rose-600 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>불합격</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item.id, "na")}
                          className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            item.status === "na"
                              ? "bg-slate-700 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <span>N/A</span>
                        </button>
                      </div>

                      {item.status === "fail" && (
                        <div className="p-2 rounded-lg bg-rose-50 text-[10px] text-rose-800 space-y-1 border border-rose-100">
                          <div>📍 <strong>불량 위치:</strong> {item.defectLocation || "미입력"}</div>
                          <div>✍️ <strong>조치 지시:</strong> {item.actionNotes || "현장 조치 요청"}</div>
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
                      <span>클라우드 동기화 중...</span>
                    ) : mobileSubmitted ? (
                      <span className="text-emerald-300 flex items-center gap-1">
                        <Check className="w-4 h-4" /> 점검 보고서 자동 생성 완료!
                      </span>
                    ) : (
                      <span>전자서명 및 점검 완료 제출</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-400 mt-3 font-semibold">
              실제 현장 감리원·반장님이 사용하는 모바일 화면
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}