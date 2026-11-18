import React from "react";
import { CameraOff, AlertOctagon, FileSpreadsheet } from "lucide-react";
import { PROBLEM_CARDS } from "@/lib/constants";

export function ProblemSection() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "CameraOff":
        return <CameraOff className="w-6 h-6 text-rose-600" />;
      case "AlertOctagon":
        return <AlertOctagon className="w-6 h-6 text-amber-600" />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertOctagon className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Pain Points
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight mt-3">
            현장 점검 끝내고 사무실 와서 <br className="hidden sm:inline" />
            또다시 한글·엑셀과 씨름하고 계신가요?
          </h2>
          <p className="mt-4 text-base text-slate-600 font-medium">
            비효율적인 수기 점검과 사진 대지 작성 방식은 현장의 시간을 뺏고 중요한 안전 조치를 누락시킵니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PROBLEM_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 flex flex-col justify-between shadow-card hover:shadow-xl hover:border-slate-300 transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-6">
                  {getIcon(card.icon)}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <blockquote className="text-xs italic text-slate-500 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {card.quote}
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}