import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/Card';

export function CommunityPage() {
  return (
    <div className="page">
      <PageHeader
        title="커뮤니티"
        subtitle="내 동물 자랑하기 (곧 만나요)"
      />
      <EmptyState
        emoji="💌"
        title="준비 중이에요"
        description="다른 보호자들과 사진을 나누는 공간을 만들고 있어요. MVP 이후 공개됩니다."
      />
      <div className="mt-6 rounded-card border border-line bg-gray-50 p-4 text-[12px] leading-relaxed text-ink-soft">
        커뮤니티는 분양·과장 광고·잘못된 의료 조언을 차단하기 위한 운영 정책을
        준비한 후 공개돼요. 의료 상담은 항상 동물병원에서 받아주세요.
      </div>
    </div>
  );
}
