import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { InspectionSite } from "@/types";

const TABLE_NAME = "checkreport_sites";

/**
 * 클라우드(Supabase 또는 Vercel Serverless)에 현장 데이터 목록 저장
 */
export async function saveSitesToCloud(sites: InspectionSite[], userEmail?: string): Promise<{ success: boolean; source: "supabase" | "serverless" | "local" }> {
  // 1. Supabase 연동 시도
  if (isSupabaseConfigured && supabase) {
    try {
      // 각 현장을 upsert (site id 기준)
      const rows = sites.map((site) => ({
        id: site.id,
        user_email: userEmail || "anonymous",
        site_name: site.siteName,
        category: site.category,
        payload: site,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from(TABLE_NAME).upsert(rows, { onConflict: "id" });
      if (!error) {
        return { success: true, source: "supabase" };
      }
      console.warn("Supabase upsert warning, falling back to serverless:", error.message);
    } catch (err) {
      console.warn("Supabase save exception, falling back:", err);
    }
  }

  // 2. 서버리스 API 동기화 Fallback
  try {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: sites[0]?.id || "SITE-2026-001",
        data: sites,
        sender: "cloud-store",
      }),
    });
    if (res.ok) {
      return { success: true, source: "serverless" };
    }
  } catch {
    // ignore
  }

  // 3. 로컬 캐시만 성공
  return { success: true, source: "local" };
}

/**
 * 클라우드에서 현장 데이터 목록 불러오기
 */
export async function fetchSitesFromCloud(roomId?: string): Promise<{ sites: InspectionSite[] | null; source: "supabase" | "serverless" | "local" }> {
  // 1. Supabase 조회 시도
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("payload")
        .order("updated_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const loadedSites = data.map((row: any) => row.payload as InspectionSite);
        return { sites: loadedSites, source: "supabase" };
      }
    } catch (err) {
      console.warn("Supabase fetch exception, falling back:", err);
    }
  }

  // 2. 서버리스 동기화 조회 Fallback
  if (roomId) {
    try {
      const res = await fetch(`/api/sync?roomId=${roomId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.exists && json.data) {
          return { sites: json.data, source: "serverless" };
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. 로컬스토리지 복원
  try {
    const saved = localStorage.getItem("checkreport_sites");
    if (saved) {
      return { sites: JSON.parse(saved), source: "local" };
    }
  } catch {
    // ignore
  }

  return { sites: null, source: "local" };
}

/**
 * Supabase Storage에 사진 직접 업로드 (선택 기능)
 */
export async function uploadPhotoToSupabase(file: File, siteId: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${siteId}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("checkreport-photos")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("checkreport-photos").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.warn("Supabase photo upload failed:", err);
    return null;
  }
}
