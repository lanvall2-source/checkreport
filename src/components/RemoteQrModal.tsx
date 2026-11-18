import React, { useState } from "react";
import { X, QrCode, Smartphone, Check, Copy, ExternalLink, Sparkles, Wifi } from "lucide-react";

interface RemoteQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
}

export function RemoteQrModal({ isOpen, onClose, siteId, siteName }: RemoteQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://checkreport.vercel.app";
  const mobileUrl = `${currentOrigin}/?mode=remote&site=${siteId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    mobileUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 상단 태그 */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-3">
          <Wifi className="w-3.5 h-3.5 animate-pulse text-blue-600" />
          <span>기기간 1초 무선 동기화</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          내 스마트폰으로 직접 사진 찍어보기
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          스마트폰 기본 카메라로 아래 QR 코드를 비추면, <br />
          <strong>스마트폰에서 찍은 사진이 이 PC 화면에 1초 만에 뜹니다!</strong>
        </p>

        {/* QR 코드 카드 */}
        <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
          <img
            src={qrCodeUrl}
            alt="스마트폰 연결 QR 코드"
            className="w-48 h-48 mx-auto rounded-xl shadow-xs bg-white p-2"
          />
          <div className="text-[11px] font-bold text-slate-600 mt-2 flex items-center justify-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>{siteName}</span>
          </div>
        </div>

        {/* 모바일 URL 복사 & 직접 열기 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <input
              type="text"
              readOnly
              value={mobileUrl}
              className="bg-transparent px-2 text-slate-600 font-mono text-[11px] flex-1 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 text-[11px]">복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">링크 복사</span>
                </>
              )}
            </button>
          </div>

          <a
            href={mobileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>새 탭에서 모바일 전용 뷰 열어보기</span>
          </a>
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          💡 별도의 앱 설치 없이 스마트폰 웹 브라우저에서 바로 카메라가 구동됩니다.
        </p>
      </div>
    </div>
  );
}
