'use client';

/**
 * PriceDistribution Component
 * Premium visualization of price distribution band
 * User-friendly labels without technical jargon
 */

import { formatPrice } from '@/lib/robust-stats';

interface Props {
  min_clean: number;
  max_clean: number;
  p25: number;
  p50: number;
  p75: number;
}

export default function PriceDistribution({ min_clean, max_clean, p25, p50, p75 }: Props) {
  // Calculate positions as percentages
  const range = max_clean - min_clean;
  const p25Pos = ((p25 - min_clean) / range) * 100;
  const p50Pos = ((p50 - min_clean) / range) * 100;
  const p75Pos = ((p75 - min_clean) / range) * 100;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-800/50 dark:via-slate-800/30 dark:to-slate-900/50 border border-slate-200/50 dark:border-slate-700/30 p-5 opacity-0 animate-fade-in-up animate-delay-200">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-400/5 to-transparent rounded-full -translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Posizionamento nel mercato</h3>
        </div>

        {/* Distribution bar */}
        <div className="relative mb-6">
          {/* Main track */}
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
            {/* Highlighted range */}
            <div
              className="absolute h-3 bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-400 rounded-full shadow-md"
              style={{
                left: `${p25Pos}%`,
                width: `${p75Pos - p25Pos}%`,
              }}
            />
          </div>

          {/* Markers */}
          <div className="relative h-10 mt-1">
            {/* Min marker */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: `${p25Pos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-0.5 h-4 bg-teal-500" />
              <span className="mt-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400">Min</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatPrice(p25)}</span>
            </div>

            {/* Central value marker */}
            <div
              className="absolute flex flex-col items-center z-10"
              style={{ left: `${p50Pos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-1 h-5 bg-emerald-500 rounded-sm shadow-md" />
              <span className="mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Probabile</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(p50)}</span>
            </div>

            {/* Max marker */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: `${p75Pos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-0.5 h-4 bg-cyan-500" />
              <span className="mt-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">Max</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatPrice(p75)}</span>
            </div>
          </div>
        </div>

        {/* Extremes row */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Sotto media</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatPrice(min_clean)}</span>
          </div>
          <div className="text-center px-4">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">La fascia evidenziata è quella più realistica</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Sopra media</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatPrice(max_clean)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
