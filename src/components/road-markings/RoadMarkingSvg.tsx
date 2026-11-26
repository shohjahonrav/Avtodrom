import React from 'react';
import type { RoadMarkingCatalogItem } from '@/types';

export function RoadMarkingSvg({ item }: { item: RoadMarkingCatalogItem }) {
  const strokeColor =
    item.color === 'yellow' ? '#facc15' : '#f8fafc';

  return (
    <svg
      viewBox="0 0 240 84"
      className="w-full h-24 rounded-lg bg-[#272c35] border border-slate-700"
      role="img"
      aria-label={`${item.code} — ${item.name}`}
    >
      {/* Subtle asphalt border */}
      <rect x="0" y="0" width="240" height="84" fill="#272c35" />

      {item.patternType === 'solid' && (
        <line x1="16" y1="42" x2="224" y2="42" stroke={strokeColor} strokeWidth="7" />
      )}

      {item.patternType === 'double-solid' && (
        <>
          <line x1="16" y1="35" x2="224" y2="35" stroke="#f8fafc" strokeWidth="6" />
          <line x1="16" y1="49" x2="224" y2="49" stroke="#f8fafc" strokeWidth="6" />
        </>
      )}

      {item.patternType === 'dashed' && (
        <line
          x1="16"
          y1="42"
          x2="224"
          y2="42"
          stroke={strokeColor}
          strokeWidth="7"
          strokeDasharray="18 24"
        />
      )}

      {item.patternType === 'approach-dashed' && (
        <line
          x1="16"
          y1="42"
          x2="224"
          y2="42"
          stroke="#f8fafc"
          strokeWidth="7"
          strokeDasharray="36 12"
        />
      )}

      {item.patternType === 'short-dashed' && (
        <line
          x1="16"
          y1="42"
          x2="224"
          y2="42"
          stroke="#f8fafc"
          strokeWidth="6"
          strokeDasharray="10 10"
        />
      )}

      {item.patternType === 'wide-dashed' && (
        <line
          x1="16"
          y1="42"
          x2="224"
          y2="42"
          stroke="#f8fafc"
          strokeWidth="12"
          strokeDasharray="18 16"
        />
      )}

      {item.patternType === 'combined-solid-dashed' && (
        <>
          <line x1="16" y1="35" x2="224" y2="35" stroke="#f8fafc" strokeWidth="6" />
          <line
            x1="16"
            y1="49"
            x2="224"
            y2="49"
            stroke="#f8fafc"
            strokeWidth="6"
            strokeDasharray="18 16"
          />
        </>
      )}

      {item.patternType === 'stop-line' && (
        <>
          <line x1="16" y1="16" x2="224" y2="16" stroke="#94a3b8" strokeWidth="2" />
          <line x1="16" y1="68" x2="224" y2="68" stroke="#94a3b8" strokeWidth="2" />
          <line x1="120" y1="16" x2="120" y2="68" stroke="#f8fafc" strokeWidth="12" />
          <text x="58" y="46" fill="#cbd5e1" fontSize="11" fontWeight="700">
            STOP
          </text>
        </>
      )}

      {item.patternType === 'start-finish-line' && (
        <>
          <line x1="16" y1="14" x2="224" y2="14" stroke="#f8fafc" strokeWidth="2.5" />
          <line x1="16" y1="70" x2="224" y2="70" stroke="#f8fafc" strokeWidth="2.5" />
          <line x1="115" y1="14" x2="115" y2="70" stroke="#f8fafc" strokeWidth="12" />
          <text
            x="55"
            y="46"
            fill="#f8fafc"
            fontSize="12"
            fontWeight="800"
            letterSpacing="1.5"
          >
            START
          </text>
          <text
            x="138"
            y="46"
            fill="#facc15"
            fontSize="11"
            fontWeight="700"
          >
            (0,4 m)
          </text>
        </>
      )}

      {item.patternType === 'zebra' && (
        <>
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <rect
              key={idx}
              x={84}
              y={10 + idx * 11}
              width="72"
              height="6.5"
              fill={idx % 2 === 0 ? '#f8fafc' : '#facc15'}
              rx="1"
            />
          ))}
        </>
      )}

      {item.patternType === 'island' && (
        <>
          <polygon points="40,62 120,24 200,62" fill="none" stroke="#f8fafc" strokeWidth="3" />
          <line x1="72" y1="58" x2="96" y2="38" stroke="#f8fafc" strokeWidth="4" />
          <line x1="98" y1="60" x2="122" y2="30" stroke="#f8fafc" strokeWidth="4" />
          <line x1="126" y1="60" x2="146" y2="40" stroke="#f8fafc" strokeWidth="4" />
          <line x1="154" y1="60" x2="168" y2="48" stroke="#f8fafc" strokeWidth="4" />
        </>
      )}

      {item.patternType === 'arrows' && (
        <>
          <line x1="48" y1="66" x2="48" y2="26" stroke="#f8fafc" strokeWidth="5" />
          <polygon points="48,16 38,30 58,30" fill="#f8fafc" />
          <path d="M120 66 L120 34 L152 34" fill="none" stroke="#f8fafc" strokeWidth="5" />
          <polygon points="164,34 150,25 150,43" fill="#f8fafc" />
          <line x1="196" y1="66" x2="196" y2="26" stroke="#f8fafc" strokeWidth="5" />
          <polygon points="196,16 186,30 206,30" fill="#f8fafc" />
        </>
      )}

      {item.patternType === 'yield-warning-triangle' && (
        <>
          <polygon points="120,68 92,18 148,18" fill="none" stroke="#f8fafc" strokeWidth="5" />
          <line x1="16" y1="12" x2="224" y2="12" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6" />
        </>
      )}
    </svg>
  );
}
