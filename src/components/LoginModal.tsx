import React, { useState } from "react";
import { X, Mail, Shield, CheckCircle2, Sparkles, ArrowRight, Lock, AlertCircle, Info } from "lucide-react";
import type { UserSession, WaitlistSubmission } from "@/types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
  onOpenAdmin: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess, onOpenAdmin }: LoginModalProps) {
  const [tab, setTab] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickEmail = (quickEmail: string) => {
    setEmail(quickEmail);
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setNotice("올바른 이메일 주소를 입력해주세요.");
      return;
    }

    // 로컬 스토리지에서 이전 신청 내역 검색
    let companyName = "(주)체크리포트";
    let managerName = "김성우 대표";
    try {
      const stored = localStorage.getItem("checkreport_waitlist");
      if (stored) {
        const list: WaitlistSubmission[] = JSON.parse(stored);
        const matched = list.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
        if (matched) {
          companyName = matched.companyName || companyName;
          managerName = matched.managerName || managerName;
        }
      }
    } catch {
      // ignore
    }

    const session: UserSession = {
      isLoggedIn: true,
      email: email.trim(),
      companyName,
      managerName,
      trialDaysLeft: 14,
      plan: "Pro",
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem("checkreport_session", JSON.stringify(session));
    onLoginSuccess(session);
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "admin1234") {
      setAdminError("");
      onClose();
      onOpenAdmin();
    } else {
      setAdminError("비밀번호가 일치하지 않습니다. (기본: admin1234)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="p-6 pb-4 bg-gradient-to-b from-blue-50/60 to-white border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>체크리포트 로그인</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            체크리포트 콘솔에 오신 것을 환영합니다
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            신청하신 이메일로 1초 만에 로그인하여 14일 Pro 무료체험을 시작하세요.
          </p>

          {/* 탭 전환 */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => {
                setTab("user");
                setAdminError("");
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === "user"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>신청 이메일 로그인</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("admin");
                setNotice(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === "admin"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>관리자 콘솔</span>
            </button>
          </div>
        </div>

        {/* 바디 */}
        <div className="p-6 pt-4">
          {tab === "user" ? (
            <form onSubmit={handleUserLogin} className="space-y-4">
              {/* 14일 무료 체험 안심 정책 안내 배너 */}
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>14일 무위험(Opt-in) 무료 체험 안내</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  신용카드 등록 없이 시작되며, <strong>14일 후 자동 결제되지 않습니다.</strong>
                  <br />
                  체험 기간 종료 시점에 유료 전환 여부를 직접 선택하실 수 있습니다.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  신청 이메일 주소 <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setNotice(null);
                    }}
                    placeholder="예: lanvall2@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium pl-10"
                    autoFocus
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {notice && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{notice}</span>
                  </p>
                )}
              </div>

              {/* 빠른 원클릭 체험 버튼 */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5">
                <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
                  빠른 로그인 추천 계정:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickEmail("lanvall2@gmail.com")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>lanvall2@gmail.com (대표님 계정)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickEmail("demo@checkreport.kr")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>demo@checkreport.kr</span>
                  </button>
                </div>
              </div>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm bg-[#2563EB] hover:bg-blue-700 text-white shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <span>1초 만에 콘솔 로그인</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>14일간 Pro 전체 기능 무제한 이용</span>
                </span>
                <span>체험 종료 후 무료 유지 가능</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">관리자 전용 접근</p>
                <p className="text-[11px] mt-0.5">
                  체험 신청자 명단 조회 및 엑셀(CSV) 다운로드를 위한 비밀번호를 입력해주세요.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  관리자 비밀번호
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError("");
                    }}
                    placeholder="비밀번호 입력 (기본: admin1234)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-medium pl-10"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {adminError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{adminError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-900 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Shield className="w-4 h-4" />
                <span>관리자 콘솔 열기</span>
              </button>

              <p className="text-[11px] text-center text-slate-400">
                기본 데모 관리자 비밀번호: <code className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">admin1234</code>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
