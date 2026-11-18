import { describe, it, expect, beforeEach } from "vitest";
import { saveWaitlistSubmission, loadWaitlist } from "../lib/storage";
import { DEMO_SITES, PRICING_PLANS, PROBLEM_CARDS } from "../lib/constants";

// Node 환경용 localStorage Mock
const storageMock: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => storageMock[key] || null,
  setItem: (key: string, value: string) => { storageMock[key] = value; },
  removeItem: (key: string) => { delete storageMock[key]; },
  clear: () => { Object.keys(storageMock).forEach((k) => delete storageMock[k]); },
  key: (index: number) => Object.keys(storageMock)[index] || null,
  length: 0,
};

describe("체크리포트 (CheckReport) SaaS 무결성 테스트", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("사전 신청 정보 유효성 검사 - 필수값 누락 시 실패", () => {
    const res = saveWaitlistSubmission({
      companyName: "",
      managerName: "김현우",
      email: "test@company.com",
      industry: "건설·시공·감리",
      siteCount: "1~3개 현장",
      privacyAgreed: true,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("업체명");
  });

  it("사전 신청 정보 유효성 검사 - 잘못된 이메일 시 실패", () => {
    const res = saveWaitlistSubmission({
      companyName: "한국건설",
      managerName: "김현우",
      email: "invalid-email",
      industry: "건설·시공·감리",
      siteCount: "1~3개 현장",
      privacyAgreed: true,
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("이메일");
  });

  it("사전 신청 정상 저장 및 목록 로드 성공", () => {
    const res = saveWaitlistSubmission({
      companyName: "(주)한국종합건설",
      managerName: "김현우 감리원",
      email: "hyeonwoo@koreaconst.co.kr",
      phone: "010-1234-5678",
      industry: "건설·시공·감리",
      siteCount: "4~10개 현장",
      privacyAgreed: true,
    });
    expect(res.success).toBe(true);

    const list = loadWaitlist();
    expect(list.length).toBe(1);
    expect(list[0].companyName).toBe("(주)한국종합건설");
    expect(list[0].id).toMatch(/^CR-/);
  });

  it("데모 현장 데이터 3종(건설, 시설, 매장) 정상 로드", () => {
    expect(DEMO_SITES.length).toBe(3);
    const siteNames = DEMO_SITES.map((s) => s.siteName);
    expect(siteNames).toContain("판교 알파리움 복합빌딩 신축공사");
    expect(siteNames).toContain("역삼 현대타워 본관");
    expect(siteNames).toContain("올리브치킨 강남본점");
  });

  it("요금제 플랜(Starter, Pro, Enterprise) 구성 확인", () => {
    expect(PRICING_PLANS.length).toBe(3);
    expect(PRICING_PLANS[0].price).toBe("19,900");
    expect(PRICING_PLANS[1].price).toBe("49,000");
  });

  it("문제점 공감 카드 3개 정의 확인", () => {
    expect(PROBLEM_CARDS.length).toBe(3);
  });
});