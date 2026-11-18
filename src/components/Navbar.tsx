import React, { useState, useEffect } from "react";
import { ClipboardCheck, Shield, Menu, X, ArrowRight } from "lucide-react";

interface NavbarProps {
  onOpenWaitlist: () => void;
  onOpenAdmin: () => void;
}

export function Navbar({ onOpenWaitlist, onOpenAdmin }: NavbarProps) {
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

          {/* 우측 CTA 및 관리자 버튼 */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>관리자</span>
            </button>
            <button
              onClick={onOpenWaitlist}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#2563EB] hover:bg-blue-700 text-white shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <span>14일 무료 체험</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenWaitlist}
              className="px-3 py-1.5 rounded-lg font-bold text-xs bg-[#2563EB] text-white shadow-xs"
            >
              무료 체험
            </button>
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
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="text-xs font-semibold text-slate-500 flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>관리자 로그인</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}