import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { RoiMetricsSection } from "@/components/RoiMetricsSection";
import { DualInspectionDemo } from "@/components/DualInspectionDemo";
import { ProblemSection } from "@/components/ProblemSection";
import { TemplateShowcase } from "@/components/TemplateShowcase";
import { PricingSection } from "@/components/PricingSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { WaitlistModal } from "@/components/WaitlistModal";
import { LoginModal } from "@/components/LoginModal";
import { AdminWaitlistDrawer } from "@/components/AdminWaitlistDrawer";
import { MobileRemoteView } from "@/components/MobileRemoteView";
import type { UserSession } from "@/types";

export function App() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // 스마트폰 전용 리모컨 모드 확인 (?mode=remote)
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [remoteSiteId, setRemoteSiteId] = useState<string>("SITE-2026-001");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "remote") {
        setIsRemoteMode(true);
        const site = params.get("site");
        if (site) setRemoteSiteId(site);
      }
    }
  }, []);

  // 로컬 스토리지에서 이전 로그인 세션 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem("checkreport_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn) {
          setUserSession(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOpenWaitlist = () => setWaitlistOpen(true);
  const handleCloseWaitlist = () => setWaitlistOpen(false);

  const handleOpenLogin = () => setLoginOpen(true);
  const handleCloseLogin = () => setLoginOpen(false);

  const handleOpenAdmin = () => setAdminOpen(true);
  const handleCloseAdmin = () => setAdminOpen(false);

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setLoginOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("checkreport_session");
    setUserSession(null);
  };

  const handleScrollToDemo = () => {
    const demoElement = document.getElementById("demo");
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExitRemote = () => {
    setIsRemoteMode(false);
    window.history.replaceState({}, "", window.location.pathname);
  };

  // 1. 스마트폰 카메라 촬영 전용 리모트 모드 화면
  if (isRemoteMode) {
    return (
      <MobileRemoteView
        initialSiteId={remoteSiteId}
        onExitRemote={handleExitRemote}
      />
    );
  }

  // 2. 일반 반응형 메인 랜딩 및 듀얼 시뮬레이터 화면
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 네비게이션 헤더 */}
      <Navbar
        userSession={userSession}
        onOpenWaitlist={handleOpenWaitlist}
        onOpenLogin={handleOpenLogin}
        onOpenAdmin={handleOpenAdmin}
        onLogout={handleLogout}
      />

      {/* 메인 랜딩 콘텐츠 */}
      <main className="flex-1">
        <Hero onOpenWaitlist={handleOpenWaitlist} onScrollToDemo={handleScrollToDemo} />
        <RoiMetricsSection onOpenWaitlist={handleOpenWaitlist} />
        <DualInspectionDemo userSession={userSession} />
        <ProblemSection />
        <TemplateShowcase />
        <PricingSection onOpenWaitlist={handleOpenWaitlist} />
        <FaqSection />
      </main>

      {/* 푸터 */}
      <Footer onOpenWaitlist={handleOpenWaitlist} onOpenAdmin={handleOpenAdmin} />

      {/* 14일 무료 체험 신청 모달 */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={handleCloseWaitlist}
        onAutoLogin={handleLoginSuccess}
      />

      {/* 1초 이메일 간편 로그인 모달 */}
      <LoginModal
        isOpen={loginOpen}
        onClose={handleCloseLogin}
        onLoginSuccess={handleLoginSuccess}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* 관리자 데이터 열람 및 CSV 다운로드 드로어 */}
      <AdminWaitlistDrawer isOpen={adminOpen} onClose={handleCloseAdmin} />
    </div>
  );
}

export default App;
