import React, { useState, useEffect } from "react";
import { ClipboardCheck, Shield, Menu, X, ArrowRight, UserCheck, LogOut, Sparkles, LogIn } from "lucide-react";
import type { UserSession } from "@/types";

interface NavbarProps {
  userSession: UserSession | null;
  onOpenWaitlist: () => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export function Navbar({
  userSession,
  onOpenWaitlist,
  onOpenLogin,
  onOpenAdmin,
  onLogout,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
          : "bg-[#F8FAFC]/80 backdrop-blur-sm border-b border-slate-200/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* 브랜드 로고 */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#0F172A]">
                  체크리포트
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  CheckReport
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                현장 점검·사진대지 보고서 자동화 SaaS
              </span>
            </div>
          </a>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-bold text-slate-600">
            <a href="#demo" className="hover:text-blue-600 transition-colors">
              실시간 점검 체험
            </a>
            <a href="#roi" className="hover:text-blue-600 transition-colors">
              도입 성과
            </a>
            <a href="#templates" className="hover:text-blue-600 transition-colors">
              업종별 점검표
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">
              요금제
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* 우측 로그인 세션 & CTA 버튼 */}
          <div className="hidden sm:flex items-center gap-3">
            {userSession ? (
              /* 로그인 상태 */
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {userSession.managerName || "회원"} 님
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Pro 체험 D-14</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {userSession.companyName || userSession.email}
                    </span>
                  </div>
                </div>
                <div className="h-5 w-px bg-slate-200 ml-1" />
                <button
                  onClick={onLogout}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[11px]">로그아웃</span>
                </button>
              </div>
            ) : (
              /* 비로그인 상태 */
              <>
                <button
                  onClick={onOpenLogin}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>로그인</span>
                </button>
                <button
                  onClick={onOpenAdmin}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2.5 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                  title="관리자 콘솔"
                >
                  <Shield className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenWaitlist}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#2563EB] hover:bg-blue-700 text-white shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
                >
                  <span>14일 무료 체험</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <div className="flex sm:hidden items-center gap-2">
            {userSession ? (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700">
                <UserCheck className="w-3.5 h-3.5" />
                <span>D-14 체험중</span>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-2.5 py-1.5 rounded-lg font-bold text-xs bg-slate-100 text-slate-700"
              >
                로그인
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {userSession && (
              <div className="px-3 py-2 bg-blue-50/70 rounded-xl mx-2 mb-2 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-950">
                    {userSession.managerName} ({userSession.companyName})
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Pro 플랜 무료 체험 잔여 14일 (카드 자동결제 없음)
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-xs text-rose-600 font-bold px-2 py-1 bg-white rounded border border-rose-200"
                >
                  로그아웃
                </button>
              </div>
            )}
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              실시간 점검 체험
            </a>
            <a
              href="#roi"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              도입 성과
            </a>
            <a
              href="#templates"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              업종별 점검표
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              요금제
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              자주 묻는 질문 (FAQ)
            </a>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
              {!userSession ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>이메일 간편 로그인</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="text-xs font-semibold text-slate-500 flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>관리자</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="text-xs font-semibold text-slate-500 flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>관리자 콘솔</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
