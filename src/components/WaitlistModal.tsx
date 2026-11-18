import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck, Building2, User, Mail, Phone, Briefcase } from "lucide-react";
import { INDUSTRY_OPTIONS } from "@/lib/constants";
import { saveWaitlistSubmission } from "@/lib/storage";
import type { IndustryCategory } from "@/types";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState<IndustryCategory>("건설·시공·감리");
  const [siteCount, setSiteCount] = useState("1~3개 현장");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const submissionData = {
      companyName,
      managerName,
      email,
      phone,
      industry,
      siteCount,
      privacyAgreed,
    };

    const result = saveWaitlistSubmission(submissionData);

    if (!result.success) {
      setIsSubmitting(false);
      setErrorMessage(result.error || "신청에 실패했습니다. 다시 확인해 주세요.");
      return;
    }

    // 서버리스 이메일 발송 호출 (API 준비 시 작동)
    try {
      await fetch("/api/send-waitlist-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
    } catch (err) {
      console.warn("이메일 발송 요청 오류(로컬 저장은 완료됨):", err);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    setCompanyName("");
    setManagerName("");
    setEmail("");
    setPhone("");
    setPrivacyAgreed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 닫기 버튼 */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* 신청 성공 완료 화면 */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-subtle animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">
              14일 무료 체험 신청이 완료되었습니다!
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              <strong className="text-slate-900">{companyName}</strong> ({managerName} 님), 반갑습니다. <br />
              입력해주신 이메일(<span className="text-[#2563EB] font-bold">{email}</span>)로 서비스 계정 활성화 안내 및 모바일 점검 링크가 발송되었습니다.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 text-left space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>체크리포트 Pro 플랜 14일 무료 제공</span>
              </div>
              <p>&bull; 점검 현장 최대 25개 및 모바일 사용자 10명 자유 등록</p>
              <p>&bull; A4 사진대지 및 안전 보고서 무제한 PDF 출력 지원</p>
              <p>&bull; 신용카드 결제 등록 없이 14일간 100% 무료</p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-subtle transition-all cursor-pointer mt-4"
            >
              확인 완료
            </button>
          </div>
        ) : (
          /* 신청 입력 폼 */
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md">
                14 Days Free Trial
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] mt-2 tracking-tight">
                체크리포트 14일 무료 체험 신청
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                복잡한 계약 없이 현장 점검과 사진 대지 자동 생성을 직접 체험해 보세요.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  업체명 (회사명) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="예: (주)한국종합건설, 현대타워 관리사무소"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    담당자명 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="김현우 감리원"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    업종 구분 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value as IndustryCategory)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden bg-white transition-all cursor-pointer"
                    >
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  이메일 (계정 활성화 안내) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="manager@company.co.kr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">연락처 (선택)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">관리 점검 현장 수</label>
                  <select
                    value={siteCount}
                    onChange={(e) => setSiteCount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-600 outline-hidden bg-white cursor-pointer"
                  >
                    <option value="1~3개 현장">1~3개 현장</option>
                    <option value="4~10개 현장">4~10개 현장</option>
                    <option value="11~25개 현장">11~25개 현장</option>
                    <option value="25개 이상">25개 이상 (기업용)</option>
                  </select>
                </div>
              </div>

              {/* 개인정보 동의 */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    required
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                  <span>
                    체크리포트 서비스 체험 안내 및 계정 발송을 위한 개인정보 수집에 동의합니다.{" "}
                    <span className="text-red-500 font-bold">*</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer mt-2"
              >
                {isSubmitting ? "계정 신청 처리 중..." : "14일 무료 체험 즉시 신청하기"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}