import React from "react";
import { Check, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { PRICING_PLANS } from "@/lib/constants";

interface PricingSectionProps {
  onOpenWaitlist: () => void;
}

export function PricingSection({ onOpenWaitlist }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight mt-3">
            점검 현장 규모에 맞춘 <br className="hidden sm:inline" />
            합리적인 월 구독 요금제
          </h2>
          <p className="mt-4 text-base text-slate-600 font-medium">
            모든 플랜에 14일 무료 체험이 제공되며, 신용카드 등록 없이 바로 시작할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-200 relative ${
                plan.highlight
                  ? "bg-white border-2 border-[#2563EB] shadow-xl md:-translate-y-2"
                  : "bg-white border border-slate-200 shadow-card hover:border-slate-300"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div>
                {!plan.highlight && (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-2xl font-black text-[#0F172A] mt-3">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium min-h-[36px]">
                  {plan.description}
                </p>

                <div className="mt-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                      {plan.price === "맞춤 견적" ? plan.price : `₩${plan.price}`}
                    </span>
                    {plan.price !== "맞춤 견적" && (
                      <span className="text-xs font-semibold text-slate-500">/ 월 (VAT 별도)</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="text-xs font-bold text-slate-900 mb-2">포함된 기능:</div>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={onOpenWaitlist}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    plan.highlight
                      ? "bg-[#2563EB] hover:bg-blue-700 text-white shadow-md hover:shadow-blue-500/25 active:scale-98"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>체험 기간(14일) 종료 후 자동 결제되지 않으며, 무료 계정으로 안전하게 전환됩니다.</span>
        </div>
      </div>
    </section>
  );
}