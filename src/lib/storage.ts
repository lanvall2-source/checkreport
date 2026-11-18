import type { WaitlistSubmission } from "@/types";

const STORAGE_KEY = "checkreport_waitlist_submissions_v1";

export function loadWaitlist(): WaitlistSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("체크리포트 신청자 데이터 로드 실패:", err);
    return [];
  }
}

export function saveWaitlistSubmission(
  data: Omit<WaitlistSubmission, "id" | "createdAt">
): { success: boolean; error?: string } {
  try {
    if (!data.companyName.trim()) {
      return { success: false, error: "업체명(회사명)을 입력해 주세요." };
    }
    if (!data.managerName.trim()) {
      return { success: false, error: "담당자명을 입력해 주세요." };
    }
    if (!data.email.trim() || !data.email.includes("@")) {
      return { success: false, error: "유효한 이메일 주소를 입력해 주세요." };
    }
    if (!data.privacyAgreed) {
      return { success: false, error: "개인정보 수집 및 이용에 동의해 주세요." };
    }

    const currentList = loadWaitlist();

    const newSubmission: WaitlistSubmission = {
      ...data,
      id: `CR-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSubmission, ...currentList];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return { success: true };
  } catch (err) {
    console.error("체크리포트 신청 저장 오류:", err);
    return { success: false, error: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }
}

export function exportWaitlistToCSV(submissions: WaitlistSubmission[]) {
  if (submissions.length === 0) return;

  const headers = ["신청ID", "업체명", "담당자명", "이메일", "연락처", "업종", "점검현장수", "신청일시"];

  const rows = submissions.map((s) => [
    s.id,
    `"${s.companyName.replace(/"/g, '""')}"`,
    `"${s.managerName.replace(/"/g, '""')}"`,
    s.email,
    s.phone || "",
    s.industry,
    s.siteCount,
    new Date(s.createdAt).toLocaleString("ko-KR"),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `체크리포트_무료체험신청자_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}