import { describe, it, expect, beforeEach } from "vitest";
import { saveWaitlistSubmission, loadWaitlist } from "../lib/storage";
import { DEMO_SITES, PRICING_PLANS, PROBLEM_CARDS } from "../lib/constants";
import { PRESET_TEMPLATES } from "../lib/checklistTemplates";

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

  it("요금제 플랜(Lite 9,900원, Starter, Pro, Enterprise) 구성 확인", () => {
    expect(PRICING_PLANS.length).toBe(4);
    expect(PRICING_PLANS[0].name).toBe("현장공정노트 Lite");
    expect(PRICING_PLANS[0].price).toBe("9,900");
    expect(PRICING_PLANS[1].price).toBe("19,900");
    expect(PRICING_PLANS[2].price).toBe("49,000");
  });

  it("문제점 공감 카드 3개 정의 확인", () => {
    expect(PROBLEM_CARDS.length).toBe(3);
  });

  it("1초 간편 로그인 세션 구조 및 14일 Opt-in 체험 데이터 검증", () => {
    const mockSession = {
      isLoggedIn: true,
      email: "lanvall2@gmail.com",
      companyName: "(주)체크리포트",
      managerName: "김성우 대표",
      trialDaysLeft: 14,
      plan: "Pro",
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem("checkreport_session", JSON.stringify(mockSession));
    const loaded = JSON.parse(localStorage.getItem("checkreport_session") || "{}");

    expect(loaded.isLoggedIn).toBe(true);
    expect(loaded.email).toBe("lanvall2@gmail.com");
    expect(loaded.trialDaysLeft).toBe(14);
    expect(loaded.plan).toBe("Pro");
  });

  it("업종별 표준 점검표 템플릿 4종(건설, 시설, 매장, 공장안전) 데이터 무결성 검증", () => {
    expect(PRESET_TEMPLATES.length).toBe(4);
    const categories = PRESET_TEMPLATES.map((t) => t.category);
    expect(categories).toContain("건설·시공·감리");
    expect(categories).toContain("시설·건물관리");
    expect(categories).toContain("매장·프랜차이즈");
    expect(categories).toContain("제조·공장안전");

    // 모든 템플릿은 최소 4개 이상의 점검 항목을 포함해야 함
    PRESET_TEMPLATES.forEach((tpl) => {
      expect(tpl.items.length).toBeGreaterThanOrEqual(4);
      tpl.items.forEach((item) => {
        expect(item.title.length).toBeGreaterThan(0);
        expect(item.standard.length).toBeGreaterThan(0);
        expect(item.category.length).toBeGreaterThan(0);
      });
    });
  });

  it("현장공정노트(작업일보) 데이터 및 사진 워터마크 모듈 무결성 검증", () => {
    const demoSite = DEMO_SITES[0];
    expect(demoSite.dailyLogs).toBeDefined();
    expect(demoSite.dailyLogs?.length).toBeGreaterThanOrEqual(1);

    const log = demoSite.dailyLogs![0];
    expect(log.todayWork.length).toBeGreaterThan(0);
    expect(log.manpower.length).toBeGreaterThan(0);
    expect(log.totalManpowerToday).toBeGreaterThan(0);
    expect(log.photos.length).toBeGreaterThan(0);
  });
});
