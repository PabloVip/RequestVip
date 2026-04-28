'use client';

import { useTheme } from '@/components/theme-provider';

interface Bucket {
  hour: string;
  count: number;
}

interface Props {
  buckets: Bucket[];
}

export default function RequestsChart({ buckets }: Props) {
  const { resolved } = useTheme();
  const max = Math.max(...buckets.map(b => b.count), 1);
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 16, bottom: 36, left: 32 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = chartW / buckets.length;
  const barGap = 6;

  const accent = resolved === 'dark' ? '#A78BFA' : '#6D28D9';
  const grid = resolved === 'dark' ? '#1f1f1f' : '#e4e4e7';
  const labelColor = resolved === 'dark' ? '#71717a' : '#52525b';
  const numberColor = resolved === 'dark' ? '#a1a1aa' : '#3f3f46';

  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '0.5px solid var(--border-subtle)',
      padding: '1.25rem',
      borderRadius: '12px',
      overflowX: 'auto',
    }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', minHeight: '200px' }}
      >
        {[0, 0.5, 1].map(t => (
          <g key={t}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + chartH * (1 - t)}
              y2={padding.top + chartH * (1 - t)}
              stroke={grid}
              strokeWidth="0.5"
            />
            <text
              x={padding.left - 6}
              y={padding.top + chartH * (1 - t) + 4}
              fill={labelColor}
              fontSize="10"
              textAnchor="end"
              fontFamily="Geist, sans-serif"
            >
              {Math.round(max * t)}
            </text>
          </g>
        ))}

        {buckets.map((b, i) => {
          const h = (b.count / max) * chartH;
          const x = padding.left + i * barWidth + barGap / 2;
          const y = padding.top + chartH - h;
          const w = barWidth - barGap;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={accent}
                rx="3"
              />
              {b.count > 0 && (
                <text
                  x={x + w / 2}
                  y={y - 5}
                  fill={numberColor}
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="500"
                  fontFamily="Geist, sans-serif"
                >
                  {b.count}
                </text>
              )}
              {(buckets.length <= 8 || i % 2 === 0) && (
                <text
                  x={x + w / 2}
                  y={height - padding.bottom + 18}
                  fill={labelColor}
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Geist, sans-serif"
                >
                  {b.hour}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
