import React from "react";
import { ArrowRight, Smartphone, MonitorCheck, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

interface HeroProps {
  onOpenWaitlist: () => void;
  onScrollToDemo: () => void;
}

export function Hero({ onOpenWaitlist, onScrollToDemo }: HeroProps) {
  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* 상단 타깃팅 알림 뱃지 */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>건설·시설·매장 현장 관리자의 칼퇴를 돕는 보고서 자동화 솔루션</span>
        </div>

        {/* 메인 헤드라인 */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.18] max-w-4xl mx-auto">
          현장에서 스마트폰으로 찰칵, <br />
          <span className="text-[#2563EB] relative inline-block">
            사무실 복귀 전
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-blue-100 -z-10 rounded-sm" />
          </span>{" "}
          보고서 완성.
        </h1>

        {/* 서브 카피 */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          PC에서 점검표를 만들고 모바일에서 점검하면 <br className="hidden sm:inline" />
          공문 규격 A4 사진 대지와 안전 보고서가 1초 만에 자동 생성됩니다.
        </p>

        {/* CTA 버튼 그룹 */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            onClick={onOpenWaitlist}
            className="w-full sm:w-auto px-7 py-4 rounded-xl font-black text-sm sm:text-base bg-[#2563EB] hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>14일 무료 체험 시작</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={onScrollToDemo}
            className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-sm sm:text-base bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>실시간 점검 체험하기</span>
          </button>
        </div>

        {/* 3대 핵심 특징 요약 칩 */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">설치 없는 모바일 웹앱</span>
              <span className="text-slate-500">반장님·외주도 링크로 즉시 점검</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">A4 사진대지 1초 출력</span>
              <span className="text-slate-500">사진 오려 붙이던 야근 100% 해소</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">중대재해 대비 이력 관리</span>
              <span className="text-slate-500">미조치 위험 항목 누락 방지</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}