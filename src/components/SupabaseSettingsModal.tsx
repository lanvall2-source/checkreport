import React, { useState } from "react";
import { X, Database, CheckCircle2, AlertCircle, RefreshCw, Key, Globe, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured, configureSupabase, resetSupabaseConfig } from "@/lib/supabaseClient";

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseSettingsModal({ isOpen, onClose }: SupabaseSettingsModalProps) {
  const [url, setUrl] = useState(() => {
    try {
      const saved = localStorage.getItem("checkreport_supabase_config");
      if (saved) return JSON.parse(saved).url || "";
    } catch {
      // ignore
    }
    return import.meta.env.VITE_SUPABASE_URL || "";
  });

  const [anonKey, setAnonKey] = useState(() => {
    try {
      const saved = localStorage.getItem("checkreport_supabase_config");
      if (saved) return JSON.parse(saved).anonKey || "";
    } catch {
      // ignore
    }
    return import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      alert("Supabase URL과 Anon Key를 모두 입력해 주세요.");
      return;
    }
    const success = configureSupabase(url.trim(), anonKey.trim());
    if (success) {
      alert("Supabase 연결 정보가 저장되었습니다. 페이지를 새로고침하여 적용합니다.");
      onClose();
    }
  };

  const handleReset = () => {
    if (confirm("Supabase 연결 정보를 초기화하고 기본 로컬/서버리스 모드로 돌아가시겠습니까?")) {
      resetSupabaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Supabase 클라우드 데이터베이스 연동
              </h3>
              <p className="text-[11px] text-slate-400">
                어떤 기기에서 접속해도 현장 점검 데이터가 영구 보존됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-5 text-xs">
          {/* 현재 상태 배너 */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isSupabaseConfigured
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {isSupabaseConfigured ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Supabase 클라우드 DB 연결 활성화됨</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>현재 로컬 브라우저 + 서버리스 임시 동기화 모드</span>
                </>
              )}
            </div>
            {isSupabaseConfigured && (
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                영구 저장 중
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Project URL</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Anon Public Key</span>
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-slate-600 text-[11px]">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>안전한 클라우드 저장 안내</span>
            </div>
            <p>
              Supabase 연동 시 작성한 모든 현장 정보 및 사진 점검 내역이 PostgreSQL 클라우드 DB에 실시간 안전하게 저장되며, 팀원 및 모바일 기기와 완벽히 동기화됩니다.
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
            {isSupabaseConfigured ? (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer"
              >
                연결 해제
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>연결 및 저장</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
