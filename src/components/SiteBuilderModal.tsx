import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  MapPin,
  User,
  Phone,
  Layers,
  Camera,
  ArrowRight,
} from "lucide-react";
import { PRESET_TEMPLATES } from "@/lib/checklistTemplates";
import { INDUSTRY_OPTIONS } from "@/lib/constants";
import type { IndustryCategory, InspectionSite, CheckItem } from "@/types";

interface SiteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newSite: InspectionSite) => void;
  defaultManagerName?: string;
  defaultCompanyName?: string;
}

export function SiteBuilderModal({
  isOpen,
  onClose,
  onCreated,
  defaultManagerName = "",
  defaultCompanyName = "",
}: SiteBuilderModalProps) {
  // 현장 기본 정보 상태
  const [siteName, setSiteName] = useState("");
  const [client, setClient] = useState(defaultCompanyName || "");
  const [address, setAddress] = useState("");
  const [managerName, setManagerName] = useState(defaultManagerName || "");
  const [managerPhone, setManagerPhone] = useState("010-");
  const [scheduledDate, setScheduledDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [category, setCategory] = useState<IndustryCategory>("건설·시공·감리");
  const [templateTitle, setTemplateTitle] = useState("정기 현장 점검표");

  // 점검 항목 리스트 상태
  const [items, setItems] = useState<Omit<CheckItem, "status">[]>([
    {
      id: "ITEM-01",
      category: "안전 시설",
      title: "작업장 안전난간 및 개구부 덮개 밀폐 상태",
      standard: "임의 해체 금지 및 안전 표지 부착 여부",
      photoRequired: true,
    },
    {
      id: "ITEM-02",
      category: "개인 보호구",
      title: "근로자 안전모 및 안전화 착용 상태",
      standard: "턱끈 체결 및 KCs 인증 보호구 착용",
      photoRequired: false,
    },
  ]);

  if (!isOpen) return null;

  // 템플릿 불러오기
  const handleApplyTemplate = (tplId: string) => {
    const tpl = PRESET_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setCategory(tpl.category);
    setTemplateTitle(tpl.name);
    setItems(
      tpl.items.map((it, idx) => ({
        ...it,
        id: `ITEM-${String(idx + 1).padStart(2, "0")}`,
      }))
    );
  };

  // 새 항목 추가
  const handleAddItem = () => {
    const nextNum = items.length + 1;
    setItems([
      ...items,
      {
        id: `ITEM-${String(nextNum).padStart(2, "0")}`,
        category: "일반 점검",
        title: "",
        standard: "",
        photoRequired: true,
      },
    ]);
  };

  // 항목 삭제
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert("점검 항목은 최소 1개 이상 필요합니다.");
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  // 항목 필드 업데이트
  const handleItemChange = (index: number, field: keyof Omit<CheckItem, "status">, val: any) => {
    setItems(
      items.map((it, idx) => {
        if (idx !== index) return it;
        return { ...it, [field]: val };
      })
    );
  };

  // 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      alert("현장명을 입력해 주세요.");
      return;
    }

    // 빈 제목 항목 확인
    const validItems = items.filter((it) => it.title.trim().length > 0);
    if (validItems.length === 0) {
      alert("점검 항목명을 최소 1개 이상 작성해 주세요.");
      return;
    }

    const newSiteId = `SITE-${Date.now().toString().slice(-6)}`;
    const fullItems: CheckItem[] = validItems.map((it, idx) => ({
      ...it,
      id: `CHK-${String(idx + 1).padStart(2, "0")}`,
      status: "pending",
    }));

    const newSite: InspectionSite = {
      id: newSiteId,
      siteName: siteName.trim(),
      client: client.trim() || "본사",
      address: address.trim() || "현장 주소 미지정",
      managerName: managerName.trim() || "현장 담당자",
      managerPhone: managerPhone.trim(),
      scheduledDate,
      category,
      templateTitle: templateTitle.trim() || "현장 점검표",
      progressPercent: 0,
      totalItems: fullItems.length,
      completedItems: 0,
      failedItems: 0,
      status: "scheduled",
      items: fullItems,
    };

    onCreated(newSite);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* 모달 헤더 */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                새 점검 현장 등록 & 점검표 빌더
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                현장 정보를 입력하고 업종별 표준 점검표 템플릿을 불러와 바로 모바일 점검을 시작하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 모달 본문 (스크롤) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* 섹션 1: 현장 기본 정보 */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-black text-slate-900">현장 기본 정보</h4>
              <span className="text-xs text-slate-400">(* 표시는 필수)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* 현장명 */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  현장명 / 프로젝트명 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="예: 판교 2차 데이터센터 신축공사"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* 업종 카테고리 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">업종 분류</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IndustryCategory)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
                >
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 고객사/발주처 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">발주처 / 고객사</label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="예: 현대건설 / 자산운용"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* 담당자명 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">점검 담당자</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="예: 홍길동 소장"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* 점검 예정일 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">점검 일자</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* 현장 주소 */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">현장 주소 / 세부 위치</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="예: 경기도 성남시 분당구 판교역로 100"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">담당자 연락처</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 섹션 2: 점검표 템플릿 불러오기 */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  업종별 추천 표준 점검표 불러오기 (원클릭)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">클릭 시 아래 점검 항목이 자동 세팅됩니다</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_TEMPLATES.map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl.id)}
                  className="p-3 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {tpl.category}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-700">
                    {tpl.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    항목 {tpl.items.length}개 · {tpl.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 섹션 3: 점검표 항목 빌더 */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  점검 항목 구성 ({items.length}개)
                </h4>
              </div>

              {/* 점검표 명칭 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold shrink-0">점검표 명칭:</span>
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="예: 정기 패트롤 안전점검표"
                  className="px-3 py-1 text-xs rounded-lg border border-slate-300 font-bold text-slate-800 focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            {/* 항목 편집 리스트 테이블 */}
            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col md:flex-row items-start md:items-center gap-3 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {index + 1}
                  </span>

                  {/* 구분(카테고리) */}
                  <div className="w-full md:w-32 shrink-0">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => handleItemChange(index, "category", e.target.value)}
                      placeholder="구분(예: 철근공사)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* 점검 항목명 */}
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(index, "title", e.target.value)}
                      placeholder="점검 항목명 (예: 개구부 덮개 및 난간대 설치 상태)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* 점검 기준 */}
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={item.standard}
                      onChange={(e) => handleItemChange(index, "standard", e.target.value)}
                      placeholder="판정 기준 (예: 틈새 50mm 이내 밀폐 고정)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* 사진 필수 체크박스 */}
                  <label className="flex items-center gap-1.5 shrink-0 cursor-pointer select-none px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-bold text-slate-700">사진 필수</span>
                    <input
                      type="checkbox"
                      checked={item.photoRequired}
                      onChange={(e) => handleItemChange(index, "photoRequired", e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 rounded-sm"
                    />
                  </label>

                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="항목 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* 항목 추가 버튼 */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50 hover:bg-blue-50/50 text-slate-600 hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ 점검 항목 1줄 추가하기</span>
            </button>
          </div>

          {/* 모달 하단 액션 버튼 */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>현장 및 점검표 생성 완료</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
