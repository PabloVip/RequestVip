'use client';

interface Bucket {
  hour: string;
  count: number;
}

interface Props {
  buckets: Bucket[];
}

export default function RequestsChart({ buckets }: Props) {
  const max = Math.max(...buckets.map(b => b.count), 1);
  const width = 600;
  const height = 180;
  const padding = { top: 16, right: 16, bottom: 32, left: 32 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = chartW / buckets.length;
  const barGap = 4;

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      padding: '1rem',
      borderRadius: '12px',
      overflowX: 'auto',
    }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', minHeight: '180px' }}
      >
        {[0, 0.5, 1].map(t => (
          <g key={t}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + chartH * (1 - t)}
              y2={padding.top + chartH * (1 - t)}
              stroke="#2a2a2a"
              strokeWidth="0.5"
            />
            <text
              x={padding.left - 6}
              y={padding.top + chartH * (1 - t) + 4}
              fill="#666"
              fontSize="10"
              textAnchor="end"
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
                fill="#fff"
                rx="2"
              />
              {b.count > 0 && (
                <text
                  x={x + w / 2}
                  y={y - 4}
                  fill="#aaa"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {b.count}
                </text>
              )}
              {(buckets.length <= 8 || i % 2 === 0) && (
                <text
                  x={x + w / 2}
                  y={height - padding.bottom + 16}
                  fill="#666"
                  fontSize="10"
                  textAnchor="middle"
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
