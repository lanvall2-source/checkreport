-- =========================================================
-- 체크리포트 (CheckReport) SaaS - Supabase DB 스키마
-- Supabase 대시보드 > SQL Editor에 복사하여 [RUN] 하시면 즉시 세팅됩니다.
-- =========================================================

-- 1. 현장 및 점검표 통합 저장 테이블
CREATE TABLE IF NOT EXISTS public.checkreport_sites (
    id TEXT PRIMARY KEY,                           -- 현장 고유 ID (예: SITE-2026-001)
    user_email TEXT NOT NULL DEFAULT 'anonymous',  -- 소유자 이메일
    site_name TEXT NOT NULL,                       -- 현장명
    category TEXT NOT NULL,                        -- 업종 분류
    payload JSONB NOT NULL,                        -- 현장 및 점검표 전체 데이터 (CheckItem 배열, 통계 등)
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 검색 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_checkreport_sites_user_email ON public.checkreport_sites (user_email);
CREATE INDEX IF NOT EXISTS idx_checkreport_sites_updated_at ON public.checkreport_sites (updated_at DESC);

-- RLS (Row Level Security) 설정: 익명 및 인증 사용자 모두 읽기/쓰기 허용 (데모 및 PoC 모드)
ALTER TABLE public.checkreport_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for demo sites"
ON public.checkreport_sites
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. 현장 사진 저장용 Storage 버킷 생성 (선택)
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkreport-photos', 'checkreport-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public photo uploads"
ON storage.objects
FOR ALL
USING (bucket_id = 'checkreport-photos')
WITH CHECK (bucket_id = 'checkreport-photos');
