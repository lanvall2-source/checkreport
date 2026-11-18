import React from "react";
import { ClipboardCheck, Shield, Heart } from "lucide-react";

interface FooterProps {
  onOpenWaitlist: () => void;
  onOpenAdmin: () => void;
}

export function Footer({ onOpenWaitlist, onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 text-xs font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">체크리포트</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                CheckReport
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              PC에서 점검표를 만들고 모바일에서 점검하면 공문 규격 A4 사진대지와 안전 보고서가 1초 만에 자동 생성되는 현장 점검 자동화 SaaS 솔루션입니다.
            </p>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>체크리포트 | 고객지원: support@checkreport.kr</div>
              <div>사업장: 서울특별시 서초구 강남대로 | 안전 및 품질 검증 시스템</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-4">서비스 바로가기</h4>
            <ul className="space-y-2.5">
              <li><a href="#demo" className="hover:text-white transition-colors">실시간 점검 체험</a></li>
              <li><a href="#roi" className="hover:text-white transition-colors">도입 성과 (ROI)</a></li>
              <li><a href="#templates" className="hover:text-white transition-colors">업종별 점검표 템플릿</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">요금제 안내</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">자주 묻는 질문</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-4">관리 및 보안</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={onOpenWaitlist}
                  className="hover:text-white transition-colors text-left font-bold text-blue-400 cursor-pointer"
                >
                  14일 무료 체험 신청 &rarr;
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-slate-400"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>관리자 로그인 (신청자 명단)</span>
                </button>
              </li>
              <li className="text-slate-500 pt-2 text-[11px]">
                TLS 1.3 암호화 보안 전송 및 중대재해처벌법 대비 클라우드 보관
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>&copy; 2026 체크리포트 (CheckReport). All rights reserved.</div>
          <div className="flex items-center gap-1">
            <span>현장 관리자의 정시 퇴근을 응원합니다.</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}