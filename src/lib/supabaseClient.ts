import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 환경변수 우선, 없으면 로컬스토리지에 저장된 사용자 정의 Supabase 설정 확인
const envUrl = import.meta.env.VITE_SUPABASE_URL || "";
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

let cachedUrl = envUrl;
let cachedKey = envKey;

if (typeof window !== "undefined" && (!cachedUrl || !cachedKey)) {
  try {
    const savedConfig = localStorage.getItem("checkreport_supabase_config");
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.url && parsed.anonKey) {
        cachedUrl = parsed.url;
        cachedKey = parsed.anonKey;
      }
    }
  } catch {
    // ignore
  }
}

export const isSupabaseConfigured = Boolean(cachedUrl && cachedKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(cachedUrl, cachedKey)
  : null;

/**
 * 런타임에서 Supabase 연결 정보 동적 저장 (설정 모달용)
 */
export function configureSupabase(url: string, anonKey: string): boolean {
  if (!url || !anonKey) return false;
  try {
    localStorage.setItem(
      "checkreport_supabase_config",
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

/**
 * Supabase 연결 정보 초기화
 */
export function resetSupabaseConfig() {
  try {
    localStorage.removeItem("checkreport_supabase_config");
    window.location.reload();
  } catch {
    // ignore
  }
}
