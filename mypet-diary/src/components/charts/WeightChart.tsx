import { format, parseISO } from 'date-fns';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WeightRecord } from '@/types';
import { EmptyState } from '@/components/common/Card';

interface Props {
  records: WeightRecord[];
}

export function WeightChart({ records }: Props) {
  if (records.length === 0) {
    return (
      <EmptyState
        emoji="⚖️"
        title="체중 기록이 없어요"
        description="첫 체중을 기록하면 변화 그래프가 보여요."
      />
    );
  }

  const data = [...records]
    .sort(
      (a, b) =>
        parseISO(a.recordedAt).getTime() - parseISO(b.recordedAt).getTime(),
    )
    .map((r) => ({
      date: format(parseISO(r.recordedAt), 'MM/dd'),
      weight: r.weight,
    }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E5DFCF" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#7A6F62"
            fontSize={11}
            tickMargin={6}
          />
          <YAxis
            stroke="#7A6F62"
            fontSize={11}
            domain={['dataMin - 0.2', 'dataMax + 0.2']}
            tickFormatter={(v: number) => `${v.toFixed(1)}kg`}
            width={52}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #E5DFCF',
              fontSize: 12,
              boxShadow: '0 1px 3px rgba(47,42,38,0.08)',
            }}
            formatter={(value: number) => [`${value}kg`, '체중']}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#C15F3C"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: '#C15F3C' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function weightAdvisory(records: WeightRecord[]): string | null {
  if (records.length < 2) return null;
  const sorted = [...records].sort(
    (a, b) =>
      parseISO(a.recordedAt).getTime() - parseISO(b.recordedAt).getTime(),
  );
  const latest = sorted[sorted.length - 1];
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const baseline = [...sorted]
    .reverse()
    .find((r) => parseISO(r.recordedAt) <= twoWeeksAgo);
  if (!baseline) return null;
  const change = (latest.weight - baseline.weight) / baseline.weight;
  if (Math.abs(change) >= 0.05) {
    const direction = change > 0 ? '증가' : '감소';
    const percent = (Math.abs(change) * 100).toFixed(1);
    return `최근 2주간 체중이 ${percent}% ${direction}했어요. 한 번 확인해보세요. 걱정되면 가까운 동물병원에 문의하는 것이 좋아요.`;
  }
  return null;
}
