import React from 'react';

export function RoadSignSvg({
  code,
  size = 64,
}: {
  code: string;
  size?: number;
}) {
  const renderSignContent = () => {
    switch (code) {
      case '1.12.1':
      case '1.12.2':
        return (
          <>
            <polygon points="50,10 92,84 8,84" fill="#ffffff" stroke="#dc2626" strokeWidth="8" strokeLinejoin="round" />
            {code === '1.12.1' ? (
              <path d="M40 72 L40 56 L58 46 L58 32" fill="none" stroke="#111827" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M60 72 L60 56 L42 46 L42 32" fill="none" stroke="#111827" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </>
        );

      case '1.13':
        return (
          <>
            <polygon points="50,10 92,84 8,84" fill="#ffffff" stroke="#dc2626" strokeWidth="8" strokeLinejoin="round" />
            <polygon points="24,52 78,76 24,76" fill="#111827" />
            <text x="52" y="54" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="800">
              12%
            </text>
          </>
        );

      case '1.14':
        return (
          <>
            <polygon points="50,10 92,84 8,84" fill="#ffffff" stroke="#dc2626" strokeWidth="8" strokeLinejoin="round" />
            <polygon points="76,52 22,76 76,76" fill="#111827" />
            <text x="48" y="54" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="800">
              12%
            </text>
          </>
        );

      case '3.243':
        return (
          <>
            <circle cx="50" cy="50" r="42" fill="#ffffff" stroke="#dc2626" strokeWidth="9" />
            <text x="50" y="61" textAnchor="middle" fill="#111827" fontSize="34" fontWeight="900">
              20
            </text>
          </>
        );

      case '5.16.1':
      case '5.16.2':
        return (
          <>
            <rect x="10" y="10" width="80" height="80" rx="8" fill="#1d4ed8" stroke="#ffffff" strokeWidth="4" />
            <polygon points="50,20 82,78 18,78" fill="#ffffff" />
            <circle cx="50" cy="40" r="5" fill="#111827" />
            <line x1="50" y1="46" x2="50" y2="62" stroke="#111827" strokeWidth="4" />
            <line x1="50" y1="62" x2="42" y2="74" stroke="#111827" strokeWidth="4" />
            <line x1="50" y1="62" x2="58" y2="74" stroke="#111827" strokeWidth="4" />
            <line x1="36" y1="74" x2="64" y2="74" stroke="#111827" strokeWidth="3" strokeDasharray="5 4" />
          </>
        );

      case '5.15':
        return (
          <>
            <rect x="10" y="10" width="80" height="80" rx="8" fill="#1d4ed8" stroke="#ffffff" strokeWidth="4" />
            <text x="50" y="68" textAnchor="middle" fill="#ffffff" fontSize="54" fontWeight="900">
              P
            </text>
          </>
        );

      case '7.4.1':
        return (
          <>
            <rect x="8" y="28" width="84" height="44" rx="4" fill="#ffffff" stroke="#111827" strokeWidth="4" />
            <rect x="20" y="38" width="38" height="20" fill="#111827" />
            <rect x="60" y="44" width="18" height="14" fill="#111827" />
            <circle cx="30" cy="62" r="5" fill="#111827" />
            <circle cx="68" cy="62" r="5" fill="#111827" />
          </>
        );

      case '7.4.3':
        return (
          <>
            <rect x="8" y="28" width="84" height="44" rx="4" fill="#ffffff" stroke="#111827" strokeWidth="4" />
            <path d="M24 56 L30 42 L62 42 L74 52 L76 56 Z" fill="#111827" />
            <circle cx="34" cy="60" r="5" fill="#111827" />
            <circle cx="66" cy="60" r="5" fill="#111827" />
          </>
        );

      case '7.6.1':
        return (
          <>
            <rect x="8" y="28" width="84" height="44" rx="4" fill="#ffffff" stroke="#111827" strokeWidth="4" />
            <rect x="18" y="56" width="64" height="8" fill="#64748b" />
            <rect x="28" y="40" width="44" height="14" rx="3" fill="#111827" />
          </>
        );

      case '1.1':
        return (
          <>
            <polygon points="50,10 92,84 8,84" fill="#ffffff" stroke="#dc2626" strokeWidth="8" strokeLinejoin="round" />
            <line x1="26" y1="62" x2="74" y2="62" stroke="#111827" strokeWidth="4" />
            <line x1="34" y1="54" x2="34" y2="72" stroke="#111827" strokeWidth="4" />
            <line x1="45" y1="54" x2="45" y2="72" stroke="#111827" strokeWidth="4" />
            <line x1="56" y1="54" x2="56" y2="72" stroke="#111827" strokeWidth="4" />
            <line x1="66" y1="54" x2="66" y2="72" stroke="#111827" strokeWidth="4" />
          </>
        );

      case '1.2':
        return (
          <>
            <polygon points="50,10 92,84 8,84" fill="#ffffff" stroke="#dc2626" strokeWidth="8" strokeLinejoin="round" />
            <rect x="34" y="50" width="30" height="16" fill="#111827" />
            <rect x="54" y="42" width="8" height="8" fill="#111827" />
            <circle cx="40" cy="70" r="4" fill="#111827" />
            <circle cx="58" cy="70" r="4" fill="#111827" />
          </>
        );

      case '1.3.1':
      case '1.3.2':
        return (
          <>
            <line x1="18" y1="26" x2="82" y2="64" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
            <line x1="82" y1="26" x2="18" y2="64" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
            <line x1="18" y1="26" x2="82" y2="64" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
            <line x1="82" y1="26" x2="18" y2="64" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
            {code === '1.3.2' && (
              <polyline points="28,72 50,86 72,72" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
            )}
          </>
        );

      case '2.5':
        return (
          <>
            <polygon
              points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="4"
            />
            <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="900">
              STOP
            </text>
          </>
        );

      default:
        return (
          <>
            <circle cx="50" cy="50" r="40" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
            <text x="50" y="55" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="700">
              {code}
            </text>
          </>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Yo‘l belgisi ${code}`}
    >
      {renderSignContent()}
    </svg>
  );
}

export function TrafficLightCard({
  phase,
  hasArrow = false,
  arrowGreen = false,
}: {
  phase: 'red' | 'yellow' | 'green';
  hasArrow?: boolean;
  arrowGreen?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
      <div className="flex flex-col gap-1.5">
        <span
          className={`h-4 w-4 rounded-full border ${
            phase === 'red' ? 'bg-red-500 border-red-300 shadow-[0_0_8px_#ef4444]' : 'bg-red-950/50 border-slate-700'
          }`}
        />
        <span
          className={`h-4 w-4 rounded-full border ${
            phase === 'yellow' ? 'bg-amber-400 border-amber-200 shadow-[0_0_8px_#facc15]' : 'bg-amber-950/50 border-slate-700'
          }`}
        />
        <span
          className={`h-4 w-4 rounded-full border ${
            phase === 'green' ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_8px_#10b981]' : 'bg-emerald-950/50 border-slate-700'
          }`}
        />
      </div>
      {hasArrow && (
        <div className="flex flex-col justify-end h-14">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold ${
              arrowGreen
                ? 'bg-emerald-600 text-white border-emerald-300'
                : 'bg-slate-900 text-slate-600 border-slate-700'
            }`}
          >
            ←
          </span>
        </div>
      )}
    </div>
  );
}
