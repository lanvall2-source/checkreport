import type { IndustryCategory, CheckItem } from "@/types";

export interface ChecklistTemplate {
  id: string;
  name: string;
  category: IndustryCategory;
  description: string;
  items: Omit<CheckItem, "status">[];
}

export const PRESET_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "tpl-const-01",
    name: "건설·토목 골조 및 안전 패트롤 점검표",
    category: "건설·시공·감리",
    description: "철근 배근, 거푸집 동바리, 개구부 추락방지 등 필수 법정 안전 점검",
    items: [
      {
        id: "ITEM-01",
        category: "철근 공사",
        title: "상하부근 배근 간격 및 철근 피복두께 확보 여부",
        standard: "설계도면 배근 간격 준수 및 스페이서(80mm 이상) 적정 배치",
        photoRequired: true,
      },
      {
        id: "ITEM-02",
        category: "거푸집 동바리",
        title: "동바리 수평연결재 2방향 체결 및 받침목 고정 상태",
        standard: "높이 2m마다 수평연결재 체결 및 침하방지 깔판 설치",
        photoRequired: true,
      },
      {
        id: "ITEM-03",
        category: "추락 방지",
        title: "개구부 덮개 고정 및 안전난간대 설치 상태",
        standard: "추락위험 개구부 덮개 밀폐 고정 및 안전표지 부착",
        photoRequired: true,
      },
      {
        id: "ITEM-04",
        category: "화재 예방",
        title: "용접·용단 작업장 소화기 비치 및 불티방지포 설치",
        standard: "반경 5m 이내 소화기 2대 이상 및 가연물 격리",
        photoRequired: true,
      },
      {
        id: "ITEM-05",
        category: "개인 보호구",
        title: "근로자 안전모·안전대 착용 및 턱끈 체결 여부",
        standard: "고소작업자 안전대 걸이대 체결 필수",
        photoRequired: false,
      },
    ],
  },
  {
    id: "tpl-fac-01",
    name: "빌딩·상가 소방·전기·시설 정기 안전점검표",
    category: "시설·건물관리",
    description: "소화설비, 방화셔터, 수전설비 누전, 비상조명등 작동 상태 점검",
    items: [
      {
        id: "ITEM-01",
        category: "소방 설비",
        title: "소화전함 내 호스 노즐 결합 및 소화기 충압 상태",
        standard: "소화기 압력 게이지 녹색 정상 범위 및 방수구 개폐 원활",
        photoRequired: true,
      },
      {
        id: "ITEM-02",
        category: "방화 구획",
        title: "비상계단 방화문 도어클로저 체결 및 폐쇄 상태",
        standard: "도어스토퍼 등 인위적 개방 고정 행위 엄금 및 물건 적치 없음",
        photoRequired: true,
      },
      {
        id: "ITEM-03",
        category: "전기 설비",
        title: "분전반 누전차단기 정상 작동 및 접지선 접속 상태",
        standard: "월 1회 시험버튼 동작 테스트 및 단자부 열화·변색 없음",
        photoRequired: true,
      },
      {
        id: "ITEM-04",
        category: "기계 설비",
        title: "저수조/배수펌프 자동 수위조절기 및 급배수관 누수 여부",
        standard: "펌프 볼류트 및 밸브 연결부 누수 없음, 전극봉 정상 감지",
        photoRequired: true,
      },
    ],
  },
  {
    id: "tpl-store-01",
    name: "프랜차이즈 매장 QSC(품질·위생·청결) 점검표",
    category: "매장·프랜차이즈",
    description: "식재료 유통기한, 냉장고 온도, 주방 위생, 고객 접객 공간 점검",
    items: [
      {
        id: "ITEM-01",
        category: "식품 위생",
        title: "냉장(0~5℃) / 냉동(-18℃ 이하) 보관 온도 준수",
        standard: "외부 디지털 온도계 정상 작동 및 온도 기록부 작성",
        photoRequired: true,
      },
      {
        id: "ITEM-02",
        category: "식재료 관리",
        title: "선입선출 및 원산지/소비기한 라벨 부착 상태",
        standard: "소비기한 경과 품목 즉시 폐기 및 소분 일자 표기",
        photoRequired: true,
      },
      {
        id: "ITEM-03",
        category: "주방 청결",
        title: "조리 기구 자외선 살균소독 및 그리스 트랩 청소",
        standard: "교차오염 방지용 칼·도마 구분 사용 및 1일 1회 기름때 제거",
        photoRequired: true,
      },
      {
        id: "ITEM-04",
        category: "홀 청결",
        title: "고객 테이블 청결 및 매장 집기 파손 여부",
        standard: "테이블 하부 오염 없음 및 의자 수평 유지",
        photoRequired: false,
      },
    ],
  },
  {
    id: "tpl-factory-01",
    name: "제조공장 안전보건(중대재해예방) 점검표",
    category: "제조·공장안전",
    description: "끼임 위험 기계 방호덮개, 비상정지장치, 지게차 통로 안전",
    items: [
      {
        id: "ITEM-01",
        category: "기계 방호",
        title: "프레스·컨베이어 회전부 방호덮개 및 인터록 스위치",
        standard: "도어 개방 시 기계 즉시 정지 인터록 정상 작동",
        photoRequired: true,
      },
      {
        id: "ITEM-02",
        category: "비상 정지",
        title: "주요 설비 비상정지 누름버튼(Emergency Stop) 작동",
        standard: "작업자 손이 닿는 위치 돌출형 적색 E-Stop 설치 및 즉시 동작",
        photoRequired: true,
      },
      {
        id: "ITEM-03",
        category: "물류 안전",
        title: "지게차 전후방 카메라, 후진 경보음 및 보행자 통로 구획",
        standard: "제한속도 준수 및 지게차 전용 통로 바닥 구획선 식별",
        photoRequired: true,
      },
      {
        id: "ITEM-04",
        category: "화학물질",
        title: "유해화학물질 물질안전보건자료(MSDS) 비치 및 국소배기장치",
        standard: "취급 장소 MSDS 게시 및 후드 흡입 풍속 기준 만족",
        photoRequired: true,
      },
    ],
  },
];
