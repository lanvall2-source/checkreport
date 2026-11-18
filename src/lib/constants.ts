import type { IndustryCategory, InspectionSite } from "@/types";

export const INDUSTRY_OPTIONS: IndustryCategory[] = [
  "건설·시공·감리",
  "시설·건물관리",
  "매장·프랜차이즈",
  "제조·공장안전",
  "기타",
];

export const PROBLEM_CARDS = [
  {
    icon: "CameraOff",
    title: "카톡 사진 지옥과 퇴근 후 야근",
    description:
      "현장에서 스마트폰으로 사진 100장 찍고, 사무실로 돌아와 파일명 정리하고 한글/엑셀 사진 대지에 한 장씩 붙여넣느라 매일 2시간씩 야근합니다.",
    quote: "“소장님, 오늘 점검한 3동 지하 크랙 사진이 카톡 방 어디에 있더라...?”",
  },
  {
    icon: "AlertOctagon",
    title: "구두 지시로 잊혀지는 불량 항목",
    description:
      "현장에서 '이거 고쳐두세요' 말로만 넘어가니 보수 조치가 되었는지 확인이 안 되고, 감리단이나 구청 점검 때 동일 지적으로 과태료 위험에 노출됩니다.",
    quote: "“지난주에 지적했던 비계 발판 고정핀, 혹시 조치 사진 받으셨나요?”",
  },
  {
    icon: "FileSpreadsheet",
    title: "현장마다 제각각인 종이 점검표",
    description:
      "클립보드 종이에 볼펜으로 체크한 뒤 서류철에 꽂아두니 분실되기 일쑤고, 1년 전 점검 이력이나 하자 원인을 다시 찾으려면 서류함을 다 뒤져야 합니다.",
    quote: "“본사 감사 나오는데 지난달 소방점검 일지 원본이 어디 갔지?”",
  },
];

export const DEMO_SITES: InspectionSite[] = [
  {
    id: "SITE-2026-001",
    siteName: "판교 알파리움 복합빌딩 신축공사",
    client: "판교개발(주)",
    address: "경기도 성남시 분당구 판교역로 145",
    managerName: "김현우 감리원",
    managerPhone: "010-3841-9921",
    scheduledDate: "2026-11-20",
    category: "건설·시공·감리",
    templateTitle: "콘크리트 타설 전 철근배근 및 안전 점검표",
    progressPercent: 75,
    totalItems: 8,
    completedItems: 6,
    failedItems: 2,
    status: "in_progress",
    items: [
      {
        id: "CHK-01",
        category: "철근 공사",
        title: "기초 상부근/하부근 배근 간격 및 이음길이 준수 여부",
        standard: "설계도서 D25 @200 간격 준수 및 이음길이 40d 이상 확보",
        status: "pass",
        photoRequired: true,
        photoBefore: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=400&q=80",
        defectLocation: "지하 2층 B-3구역 매트기초",
        actionStatus: "resolved",
      },
      {
        id: "CHK-02",
        category: "철근 공사",
        title: "기초 피복두께 스페이서(간격재) 설치 적정성",
        standard: "흙에 접하는 부분 최소 피복두께 80mm 이상 스페이서 배치",
        status: "fail",
        photoRequired: true,
        photoBefore: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80",
        defectLocation: "지하 2층 C열 외벽 접합부",
        actionNotes: "스페이서 간격 1.5m 초과로 처짐 발생. 1m 이내로 추가 설치 요망",
        actionDeadline: "2026-11-20 14:00",
        actionStatus: "pending",
      },
      {
        id: "CHK-03",
        category: "안전 시설",
        title: "개구부 덮개 및 추락방지 방호망 설치 상태",
        standard: "유효너비 300mm 이상 개구부 고정식 덮개 및 경고표지 부착",
        status: "fail",
        photoRequired: true,
        photoBefore: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
        defectLocation: "지상 1층 E/V 피트 개구부",
        actionNotes: "합판 덮개 고정 불량 및 추락주의 표지판 누락. 즉시 체결 조치",
        actionDeadline: "2026-11-20 12:00",
        actionStatus: "in_progress",
      },
      {
        id: "CHK-04",
        category: "거푸집 공사",
        title: "거푸집 동바리 수평연결재 체결 및 침하방지 조치",
        standard: "높이 2m마다 수평연결재 2방향 설치 및 전용 철물 사용",
        status: "pass",
        photoRequired: true,
        photoBefore: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=400&q=80",
        defectLocation: "지하 1층 주차장 슬래브 하부",
        actionStatus: "resolved",
      },
    ],
  },
  {
    id: "SITE-2026-002",
    siteName: "역삼 현대타워 본관",
    client: "현대자산운용(주)",
    address: "서울특별시 강남구 테헤란로 152",
    managerName: "이성민 시설팀장",
    managerPhone: "010-9182-3712",
    scheduledDate: "2026-11-21",
    category: "시설·건물관리",
    templateTitle: "빌딩 소방·전기·기계 정기 합동 안전점검표",
    progressPercent: 100,
    totalItems: 6,
    completedItems: 6,
    failedItems: 0,
    status: "completed",
    items: [
      {
        id: "FAC-01",
        category: "소방 설비",
        title: "자동화재탐지설비 수신기 감시 상태 및 예비전원 시험",
        standard: "정상 감시 점등 및 주전원 차단 시 예비전원 자동 전환 정상",
        status: "pass",
        photoRequired: true,
        photoBefore: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
        defectLocation: "1층 방재실 화재수신기",
        actionStatus: "resolved",
      },
      {
        id: "FAC-02",
        category: "피난 방화",
        title: "비상계단 방화문 자동폐쇄 및 도어클로저 작동 상태",
        standard: "방화문 장애물 적치 금지 및 완전 폐쇄 확인",
        status: "pass",
        photoRequired: true,
        photoBefore: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=400&q=80",
        defectLocation: "3층~15층 특별피난계단",
        actionStatus: "resolved",
      },
    ],
  },
  {
    id: "SITE-2026-003",
    siteName: "올리브치킨 강남본점",
    client: "올리브F&B(주)",
    address: "서울특별시 강남구 강남대로 390",
    managerName: "박지은 SV(수퍼바이저)",
    managerPhone: "010-4491-8820",
    scheduledDate: "2026-11-22",
    category: "매장·프랜차이즈",
    templateTitle: "프랜차이즈 매장 QSC(품질·위생·청결) 정기 점검표",
    progressPercent: 30,
    totalItems: 10,
    completedItems: 3,
    failedItems: 1,
    status: "in_progress",
    items: [
      {
        id: "QSC-01",
        category: "식품 위생",
        title: "냉장·냉동고 적정 보관온도 및 디지털 온도계 작동 여부",
        standard: "냉장실 0~5℃, 냉동실 -18℃ 이하 유지 및 성에 제거",
        status: "pass",
        photoRequired: true,
        photoBefore: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=400&q=80",
        defectLocation: "주방 2번 워크인 냉장고",
        actionStatus: "resolved",
      },
      {
        id: "QSC-02",
        category: "주방 청결",
        title: "튀김기 유탕 잔여물 여과 및 튀김유 산가(AV) 측정",
        standard: "산가 2.5 이하 준수 및 1일 1회 정제 필터 교체",
        status: "fail",
        photoRequired: true,
        photoBefore: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80",
        defectLocation: "조리라인 1번 튀김기",
        actionNotes: "산가 측정 결과 2.8 측정. 즉시 새 기름으로 전량 교체 요망",
        actionDeadline: "2026-11-22 17:00",
        actionStatus: "pending",
      },
    ],
  },
];

export const PRICING_PLANS = [
  {
    name: "Starter",
    badge: "소규모 팀·개인",
    price: "19,900",
    description: "현장 수가 적고 모바일 사진대지 자동 출력이 필요한 팀에 추천합니다.",
    features: [
      "월간 점검 현장 최대 5개",
      "모바일 점검 사용자 최대 3명",
      "표준 점검표 템플릿 무제한 제작",
      "A4 2단/3단 사진 대지 PDF 출력",
      "미조치 항목 트래킹 기본",
      "클라우드 사진 저장 10GB",
    ],
    ctaText: "14일 무료 체험 시작",
    highlight: false,
  },
  {
    name: "Pro",
    badge: "가장 인기 있는 요금제",
    price: "49,000",
    description: "본격적인 건설 시공, 전문 시설관리, 복수 매장을 관리하는 표준 플랜입니다.",
    features: [
      "월간 점검 현장 최대 25개",
      "모바일 점검 사용자 최대 10명",
      "중대재해처벌법 법적 증빙 보고서",
      "조치 전/후 사진 비교 자동 조판",
      "카카오톡 알림톡 미조치 독촉",
      "엑셀(XLSX) 및 PDF 일괄 다운로드",
      "클라우드 사진 저장 100GB",
    ],
    ctaText: "14일 무료 체험 시작",
    highlight: true,
  },
  {
    name: "Enterprise",
    badge: "대기업·종합건설·프랜차이즈 본사",
    price: "맞춤 견적",
    description: "전국 수십 개 현장 및 수백 개 가맹점을 본사에서 통합 관제하는 기업 플랜입니다.",
    features: [
      "점검 현장 및 계정 무제한",
      "사내 ERP / 그룹웨어 API 연동",
      "기업 전용 점검표 커스텀 조판",
      "단독 전용 클라우드 인프라",
      "전담 온보딩 엔지니어 지원",
      "SLA 99.9% 보증",
    ],
    ctaText: "도입 문의하기",
    highlight: false,
  },
];

export const FAQ_LIST = [
  {
    question: "현장에서 인터넷이나 데이터가 안 터지는 지하에서도 쓸 수 있나요?",
    answer:
      "네, 가능합니다! 체크리포트 모바일 웹앱은 오프라인 로컬 캐싱 기술을 지원하여 지하 3층이나 통신 음영 지역에서도 사진 촬영과 체크리스트 저장이 가능하며, 지상으로 올라와 네트워크가 연결되면 자동으로 서버와 동기화됩니다.",
  },
  {
    question: "보고서 출력 시 우리 회사 로고와 감리원 도장(직인)을 넣을 수 있나요?",
    answer:
      "물론입니다. 관리자 설정에서 회사 로고 이미지와 담당자 전자서명/직인을 등록해 두시면, A4 사진 대지 및 점검 결과 보고서 출력 시 표지와 결재란에 자동으로 인쇄됩니다.",
  },
  {
    question: "기존에 쓰던 회사 자체 점검표(엑셀/한글) 양식을 그대로 쓸 수 있나요?",
    answer:
      "네. 노코드 템플릿 빌더를 통해 기존 엑셀 체크리스트를 복사하여 붙여넣으면 1분 만에 모바일용 점검표로 변환됩니다. 또한 건설, 시설, 매장 분야의 30여 종 표준 법정 서식이 기본 제공됩니다.",
  },
  {
    question: "불량 항목에 대해 협력업체나 현장 반장님께 바로 조치를 요청할 수 있나요?",
    answer:
      "네. 점검 도중 불합격 항목이 발생하면 사진과 불량 위치가 포함된 '조치 요청 모바일 알림톡'을 협력사 반장님 휴대폰으로 바로 발송할 수 있으며, 반장님은 별도 가입 없이 조치 완료 사진을 올려 답장할 수 있습니다.",
  },
  {
    question: "무료 체험 기간 동안 실제 보고서 출력이 제한되나요?",
    answer:
      "아닙니다. 14일 무료 체험 기간 동안 Pro 플랜의 모든 기능(A4 사진대지 무제한 출력, 미조치 트래킹, 엑셀 다운로드)을 워터마크 없이 자유롭게 실제 현장에서 테스트해 보실 수 있습니다.",
  },
];