export type IndustryCategory = "건설·시공·감리" | "시설·건물관리" | "매장·프랜차이즈" | "제조·공장안전" | "기타";

export type InspectionStatus = "pass" | "fail" | "na" | "pending";

export interface CheckItem {
  id: string;
  category: string;
  title: string;
  standard: string; // 점검 기준
  status: InspectionStatus; // 합격, 불합격, 해당없음, 미점검
  photoRequired: boolean;
  photoBefore?: string; // 조치 전 사진
  photoAfter?: string; // 조치 후 사진
  defectLocation?: string; // 불량 위치 (예: 지하 2층 A구역 옹벽)
  actionNotes?: string; // 조치 지시 및 메모
  actionDeadline?: string; // 조치 마감일
  actionStatus?: "pending" | "in_progress" | "resolved"; // 조치 상태
}

/**
 * 현장공정노트: 직종별 출역 인원
 */
export interface TradeManpower {
  trade: string; // 예: 보통인부, 철근공, 형틀목수, 비계공, 전기, 설비
  count: number;
}

/**
 * 현장공정노트: 작업일보 사진
 */
export interface DailyWorkPhoto {
  id: string;
  url: string;
  trade: string;
  location: string;
  caption: string;
  timestamp: string;
}

/**
 * 현장공정노트: 일일 작업일보 / 공정 보고서
 */
export interface DailyWorkLog {
  id: string;
  siteId: string;
  siteName: string;
  reportDate: string; // YYYY-MM-DD
  weather: string; // 맑음, 구름조금, 흐림, 비, 눈
  temperatureHigh: number;
  temperatureLow: number;
  author: string; // 작성자 (예: 김현우 소장)
  todayWork: string[]; // 금일 주요 작업 내용
  tomorrowWork: string[]; // 명일 작업 예정 사항
  manpower: TradeManpower[]; // 공종별 출역 현황
  totalManpowerToday: number;
  cumulativeManpower: number; // 누계 투입 인원
  equipment: string[]; // 투입 장비
  material: string[]; // 주요 자재 반입 현황
  safetyNotes: string; // TBM 및 일일 안전점검 회의 메모
  photos: DailyWorkPhoto[]; // 공종별 현장 사진 (워터마크 각인 포함)
}

export interface InspectionSite {
  id: string;
  siteName: string;
  client: string;
  address: string;
  managerName: string;
  managerPhone: string;
  scheduledDate: string;
  category: IndustryCategory;
  templateTitle: string;
  progressPercent: number;
  totalItems: number;
  completedItems: number;
  failedItems: number; // 미조치/지적 항목 수
  status: "scheduled" | "in_progress" | "completed";
  items: CheckItem[];
  dailyLogs?: DailyWorkLog[]; // 현장별 작업일보 목록
}

export interface WaitlistSubmission {
  id: string;
  companyName: string;
  managerName: string;
  email: string;
  phone?: string;
  industry: IndustryCategory;
  siteCount: string;
  teamSize?: string;
  privacyAgreed: boolean;
  createdAt: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  email: string;
  companyName: string;
  managerName: string;
  trialDaysLeft: number;
  plan: "Pro" | "Starter" | "Enterprise" | "Lite";
  loginAt: string;
}
