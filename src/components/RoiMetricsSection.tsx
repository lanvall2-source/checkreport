import React, { useState } from "react";
import { Clock, ShieldCheck, FileCheck, Calculator, ArrowRight, Sparkles } from "lucide-react";

interface RoiMetricsSectionProps {
  onOpenWaitlist: () => void;
}

export function RoiMetricsSection({ onOpenWaitlist }: RoiMetricsSectionProps) {
  const [siteCount, setSiteCount] = useState<number>(6);
  const [inspectionsPerWeek, setInspectionsPerWeek] = useState<number>(2);

  // 현장당 1회 점검 후 사진대지 작성 및 정리 소요 시간: 약 1.5시간 -> 체크리포트 도입 시 15분(0.25시간)으로 단축 (회당 1.25시간 절감)
  const monthlyInspections = siteCount * inspectionsPerWeek * 4;
  const savedHoursPerMonth = Math.round(monthlyInspections * 1.25);
  // 엔지니어 시급 약 35,000원 기준 연간 비용 절감액 (만원 단위)
  const savedCostPerYearManWon = Math.round((savedHoursPerMonth * 35000 * 12) / 10000);

  const metrics = [
    {
      icon: Clock,
      value: "월 32시간",
      label: "사진대지 조판 야근 절감",
      description: "현장에서 모바일로 탭 한 번에 사진 대지가 A4 2단 규격으로 정렬되어 사무실 야근이 사라집니다.",
      subtext: "현장 관리자가 품질·안전 본연의 업무에 집중",
    },
    {
      icon: ShieldCheck,
      value: "0건",
      label: "미조치 위험 지적 누락",
      description: "불합격 항목에 대해 조치 완료 사진이 등록될 때까지 D-Day 알림톡이 협력사로 자동 발송됩니다.",
      subtext: "구청 감리 점검 및 안전 진단 과태료 원천 차단",
    },
    {
      icon: FileCheck,
      value: "100%",
      label: "중대재해 대비 법적 증빙",
      description: "점검 일시, GPS 위치, 현장 사진, 전자서명이 포함된 클라우드 보고서가 영구 보관됩니다.",
      subtext: "분실 위험 없는 안전 감사 무결성 보장",
    },
  ];

  return (
    <section id="roi" className="py-16 sm:py-24 bg-white border-y border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Proven Field ROI
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight mt-3">
            체크리포트 도입으로 달라지는 <br className="hidden sm:inline" />
            현장 관리자의 하루
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
            사진 오려 붙이기와 보고서 작성에 허비하던 시간과 스트레스를 85% 이상 줄여드립니다.
          </p>
        </div>

        {/* 3대 핵심 성과 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {metrics.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-[#F8FAFC] rounded-2xl border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between hover:border-blue-300 hover:shadow-card transition-all"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mb-5">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-base font-bold text-[#2563EB] mt-1">
                    {item.label}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{item.subtext}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 인터랙티브 ROI 절감 계산기 */}
        <div className="mt-12 bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                <Calculator className="w-3.5 h-3.5" />
                <span>우리 사업장 맞춤 절감 시뮬레이터</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  한 달에 현장 점검을 얼마나 진행하고 계신가요?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
                  슬라이더를 조절하여 체크리포트 도입 시 절약되는 야근 시간과 비용을 실시간으로 확인해보세요.
                </p>
              </div>

              {/* 슬라이더 컨트롤 */}
              <div className="space-y-5 pt-2">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                    <span className="text-slate-300">월간 관리 현장 수</span>
                    <span className="text-blue-400 font-bold text-base">{siteCount}개 현장</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={siteCount}
                    onChange={(e) => setSiteCount(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>1개</span>
                    <span>10개</span>
                    <span>20개+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                    <span className="text-slate-300">현장당 주간 점검 횟수</span>
                    <span className="text-blue-400 font-bold text-base">주 {inspectionsPerWeek}회 점검</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={inspectionsPerWeek}
                    onChange={(e) => setInspectionsPerWeek(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>주 1회</span>
                    <span>주 3회</span>
                    <span>주 5회(매일)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 계산 결과 카드 */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <Sparkles className="w-4 h-4" />
                <span>예상 절감 시뮬레이션 결과</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                  <div className="text-[11px] text-slate-300">월간 야근 절약 시간</div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                    약 {savedHoursPerMonth}시간
                  </div>
                  <div className="text-[10px] text-blue-300 mt-1">사진대지·보고서 작업 해소</div>
                </div>

                <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                  <div className="text-[11px] text-slate-300">연간 기회비용 절감액</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                    약 {savedCostPerYearManWon.toLocaleString()}만원
                  </div>
                  <div className="text-[10px] text-emerald-300 mt-1">인건비 및 안전과태료 방지</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                💡 <span className="font-semibold text-white">체크리포트 Starter 요금제(월 19,900원)</span> 기준,
                투자 대비 <strong className="text-emerald-400">약 {Math.max(15, Math.round((savedCostPerYearManWon * 10000) / (19900 * 12)))}배 이상의 가치</strong>를 현장에 돌려드립니다.
              </div>

              <button
                onClick={onOpenWaitlist}
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-[#2563EB] hover:bg-blue-600 text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/25 active:scale-98"
              >
                <span>14일 무료 체험으로 우리 현장에 도입하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}