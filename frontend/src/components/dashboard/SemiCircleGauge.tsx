'use client';

interface GaugeSegment {
  name: string;
  value: number;
  color: string;
}

interface SemiCircleGaugeProps {
  data: GaugeSegment[];
  centerValue: number | string;
  centerLabel: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function SemiCircleGauge({ data, centerValue, centerLabel }: SemiCircleGaugeProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const WIDTH = 220;
  const HEIGHT = 165;
  const CX = WIDTH / 2;
  const CY = 115;
  const RADIUS = 80;
  const STROKE_WIDTH = 20;
  const TOTAL_ARC = 240;
  const START_ANGLE = 150; // 8 o'clock position
  const GAP_DEGREES = 5;

  const activeData = data.filter(d => d.value > 0);

  const arcs: { path: string; color: string; name: string }[] = [];

  if (total > 0 && activeData.length > 0) {
    const totalGap = Math.max(0, activeData.length - 1) * GAP_DEGREES;
    const availableArc = TOTAL_ARC - totalGap;

    let currentAngle = START_ANGLE;
    activeData.forEach((segment, i) => {
      const sweep = (segment.value / total) * availableArc;
      if (sweep < 2) {
        currentAngle += sweep + (i < activeData.length - 1 ? GAP_DEGREES : 0);
        return;
      }

      arcs.push({
        path: describeArc(CX, CY, RADIUS, currentAngle, currentAngle + sweep),
        color: segment.color,
        name: segment.name,
      });

      currentAngle += sweep + (i < activeData.length - 1 ? GAP_DEGREES : 0);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: WIDTH, height: HEIGHT }}>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {/* Background track */}
          <path
            d={describeArc(CX, CY, RADIUS, START_ANGLE, START_ANGLE + TOTAL_ARC)}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
          {/* Data segments */}
          {arcs.map((arc, i) => (
            <path
              key={i}
              d={arc.path}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
          ))}
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '58%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
            {typeof centerValue === 'number' ? centerValue.toLocaleString() : centerValue}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#9CA3AF',
            fontWeight: 600,
            marginTop: '0.375rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {centerLabel}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.25rem' }}>
        {data.map((item) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: item.color,
              flexShrink: 0
            }} />
            <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
