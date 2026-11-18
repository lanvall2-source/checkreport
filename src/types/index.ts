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