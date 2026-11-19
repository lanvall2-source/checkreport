import React, { useState } from "react";
import { HardHat, Building, Store, Factory, ArrowRight, Check, FileSpreadsheet, Download, CheckCircle2, Sparkles } from "lucide-react";
import { downloadFreeTemplate } from "@/lib/exportUtils";

export function TemplateShowcase() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadTemplate = async (type: "dailylog" | "photobook" | "safety" | "facility") => {
    setDownloading(type);
    try {
      await downloadFreeTemplate(type);
    } finally {
      setDownloading(null);
    }
  };

  const FREE_TEMPLATES = [
    {
      id: "tpl-1",
      type: "dailylog" as const,
      name: "국토부 표준 공사 작업일보",
      desc: "결재란, 날씨·기온, 출역 인원, 금일 시공 및 명일 계획이 정형화된 표준 시공일보 양식",
    },
    {
      id: "tpl-2",
      type: "photobook" as const,
      name: "건설 감리 A4 현장 사진대지",
      desc: "조치 전/후 비교 사진, 결함 위치 및 지적 메모를 깔끔하게 출력하는 A4 사진첩 서식",
    },
    {
      id: "tpl-3",
      type: "safety" as const,
      name: "중대재해대응 일일 안전점검표",
      desc: "개구부 추락방지, 비계 발판, 보호구 착용, 낙하물 방호 일일 순찰 점검 체크리스트",
    },
    {
      id: "tpl-4",
      type: "facility" as const,
      name: "빌딩 소방·전기 시설점검표",
      desc: "화재수신기 감시, 방화문 자동폐쇄, 수배전반 유온, 배수펌프 정기점검 표준 서식",
    },
  ];

  const categories = [
    {
      id: "construction",
      name: "건설·시공·감리",
      icon: HardHat,
      badge: "건설기술진흥법 규격",
      title: "콘크리트 타설, 비계·동바리, 철근 배근 안전 점검",
      description: "감리원이 현장에서 도면 기준 준수 여부를 즉시 판정하고 세움터 및 감리일지에 첨부할 사진대지를 원클릭으로 조판합니다.",
      items: [
        "슬래브·보 철근 배근 간격 및 피복두께 측정",
        "거푸집 동바리 2단 수평연결재 체결 상태",
        "개구부 추락방지 방호망 및 안전난간대 설치",
        "타설 전 레이턴스 및 이물질 청소 확인",
      ],
      output: "국토부 표준 감리 체크리스트 & A4 2단 사진대지",
    },
    {
      id: "facility",
      name: "시설·빌딩관리",
      icon: Building,
      badge: "시설물안전법 및 소방법",
      title: "소방·전기·승강기·기계실 정기 순찰 점검",
      description: "방재실 화재수신기 감시부터 옥상 피난계단 방화문 작동까지 빌딩 전체 설비의 이상 유무를 QR코드 스캔과 함께 기록합니다.",
      items: [
        "자동화재탐지설비 수신기 감시 및 예비전원 시험",
        "특별피난계단 방화문 자동폐쇄 및 도어클로저",
        "수배전반 변압기 유온계 및 절연저항 측정",
        "지하 저수조 수위센서 및 배수펌프 자동 연동",
      ],
      output: "월간 시설 정기 안전점검 종합 보고서",
    },
    {
      id: "retail",
      name: "매장·프랜차이즈",
      icon: Store,
      badge: "식품위생법 QSC 기준",
      title: "가맹점 위생·청결·서비스(QSC) 수퍼바이저 점검",
      description: "SV(수퍼바이저)가 매장 순회 점검 시 튀김유 산가, 냉장고 온도, 유통기한을 점검하고 미흡 사항을 점주님 카톡으로 즉시 전송합니다.",
      items: [
        "튀김기 잔여물 여과 및 튀김유 산가(AV) 측정",
        "냉장·냉동고 적정 보관온도 및 유통기한 라벨",
        "유니폼, 위생모, 보건증 갱신 비치 상태",
        "POS 마감 정산 및 고객 응대 서비스 매뉴얼",
      ],
      output: "가맹점 QSC 평가표 & 본사 개선 지시서",
    },
    {
      id: "manufacturing",
      name: "제조·공장안전",
      icon: Factory,
      badge: "중대재해처벌법 대비",
      title: "공장 설비 일일 안전순찰 및 위험성평가 점검",
      description: "프레스, 호이스트, 화학물질 저장소 등 고위험 기계·기구의 방호장치와 비상정지 스위치를 일일 점검하고 법적 증빙을 보관합니다.",
      items: [
        "프레스 광전자식 안전장치 및 인터록 작동",
        "천장크레인 와이어로프 마모 및 훅 해지장치",
        "유해화학물질 유출 방지턱 및 MSDS 비치",
        "작업자 개인보호구(안전모, 보안경) 착용 실태",
      ],
      output: "중대재해처벌법 위험성평가 일일 순찰일지",
    },
  ];

  const current = categories[activeTab];
  const Icon = current.icon;

  return (
    <section id="templates" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Industry Versatility
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight mt-3">
            어떤 현장이든, 우리 회사 양식 그대로 <br className="hidden sm:inline" />
            1분 만에 점검표로 변환됩니다.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
            건설 감리부터 빌딩 소방 순찰, 프랜차이즈 매장 점검까지 30여 종의 표준 법정 서식이 탑재되어 있습니다.
          </p>
        </div>

        {/* 업종 탭 버튼 */}
        <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 max-w-4xl mx-auto">
          {categories.map((cat, idx) => {
            const CatIcon = cat.icon;
            const isSelected = idx === activeTab;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 sm:px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#2563EB] text-white shadow-md scale-102"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <CatIcon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 선택된 템플릿 상세 쇼케이스 카드 */}
        <div className="mt-8 max-w-4xl mx-auto bg-[#F8FAFC] border-2 border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                {current.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {current.title}
              </h3>
            </div>
            <div className="text-xs text-slate-500 font-bold bg-white px-3.5 py-2 rounded-xl border border-slate-200">
              출력 규격: <span className="text-blue-600">{current.output}</span>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-600 leading-relaxed font-medium">
            {current.description}
          </p>

          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              주요 내장 점검 항목 샘플:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {current.items.map((item, i) => (
                <div
                  key={i}
                  className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-800 font-medium shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 무료 실무 엑셀 서식 다운로드 센터 (SEO & 리드 마그넷) */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>회원가입 없이 100% 무료 제공 (Excel .xlsx)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                현장 실무 필수 표준 엑셀 서식 무료 다운로드
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                국토교통부 표준 시공일보, 감리 A4 사진대지, 중대재해 안전점검표 서식을 즉시 다운받아 현장 업무에 활용하세요.
              </p>
            </div>
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap self-center md:self-auto"
            >
              <span>스마트폰 1초 자동 생성 체험하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FREE_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-slate-50 border border-slate-200 hover:border-blue-400 p-5 rounded-2xl flex flex-col justify-between transition-all hover:shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      .XLSX 서식
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{tpl.name}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed min-h-[36px]">
                    {tpl.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>무료 배포</span>
                  </span>
                  <button
                    onClick={() => handleDownloadTemplate(tpl.type)}
                    disabled={downloading === tpl.type}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Download className="w-3 h-3 text-emerald-600" />
                    <span>{downloading === tpl.type ? "다운로드 중..." : "엑셀 저장"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}