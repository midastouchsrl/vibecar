'use client';

/**
 * Premium Loading Screen
 * Multi-step animated loading experience for valuation API calls
 */

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  carInfo: {
    brand: string;
    model: string;
    year: string;
    km: string;
    fuel?: string;
  };
}

const LOADING_STEPS = [
  { id: 1, label: 'Ricerca annunci', duration: 1500 },
  { id: 2, label: 'Analisi prezzi', duration: 2000 },
  { id: 3, label: 'Calcolo valutazione', duration: 1500 },
];

export default function LoadingScreen({ carInfo }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate through steps
    let stepIndex = 0;
    const totalDuration = LOADING_STEPS.reduce((acc, step) => acc + step.duration, 0);
    let elapsedTime = 0;

    const stepInterval = setInterval(() => {
      if (stepIndex < LOADING_STEPS.length) {
        setCurrentStep(stepIndex + 1);
        elapsedTime += LOADING_STEPS[stepIndex].duration;
        stepIndex++;
      }
    }, LOADING_STEPS[stepIndex]?.duration || 1500);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 90% (never reach 100% until actual completion)
        const target = 90;
        const increment = (target - prev) * 0.05;
        return Math.min(prev + Math.max(increment, 0.5), target);
      });
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  // Format fuel label
  const getFuelLabel = (fuel?: string) => {
    const fuelLabels: Record<string, string> = {
      'benzina': 'Benzina',
      'diesel': 'Diesel',
      'gpl': 'GPL',
      'metano': 'Metano',
      'ibrida': 'Ibrida',
      'elettrica': 'Elettrica',
    };
    return fuel ? fuelLabels[fuel] || fuel : '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--obsidian-950)]">
      {/* Background gradient orbs */}
      <div className="gradient-orb gradient-orb-teal w-[600px] h-[600px] -top-[200px] -right-[200px] fixed opacity-50" />
      <div className="gradient-orb gradient-orb-teal-muted w-[400px] h-[400px] bottom-[10%] -left-[100px] fixed opacity-30" />

      <div className="relative max-w-md w-full mx-6">
        {/* Car info card */}
        <div className="bg-[var(--obsidian-800)]/80 backdrop-blur-xl rounded-2xl border border-[var(--obsidian-600)] p-6 mb-8 animate-fade-in">
          {/* Car icon with pulse */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 animate-ping" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Car details */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {carInfo.brand} {carInfo.model}
            </h2>
            <div className="flex items-center justify-center gap-3 text-sm text-[var(--text-secondary)]">
              <span>{carInfo.year}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span>{carInfo.km} km</span>
              {carInfo.fuel && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                  <span>{getFuelLabel(carInfo.fuel)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-6">
          {/* Steps */}
          <div className="flex justify-between">
            {LOADING_STEPS.map((step, index) => {
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  {/* Step indicator */}
                  <div className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-500 ease-out
                    ${isActive
                      ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)]'
                      : 'bg-[var(--obsidian-700)] border border-[var(--obsidian-500)]'}
                  `}>
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full bg-[var(--accent)]/30 animate-ping" />
                    )}
                    {isActive ? (
                      isCurrent ? (
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )
                    ) : (
                      <span className="text-sm font-medium text-[var(--text-muted)]">{step.id}</span>
                    )}
                  </div>

                  {/* Step label */}
                  <span className={`
                    mt-2 text-xs font-medium text-center transition-colors duration-300
                    ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}
                  `}>
                    {step.label}
                  </span>

                  {/* Connector line */}
                  {index < LOADING_STEPS.length - 1 && (
                    <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5">
                      <div className={`
                        h-full transition-all duration-500 ease-out
                        ${currentStep > step.id ? 'bg-[var(--accent)]' : 'bg-[var(--obsidian-600)]'}
                      `} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-1.5 bg-[var(--obsidian-700)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Shimmer effect */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>

          {/* Current action text */}
          <p className="text-center text-sm text-[var(--text-secondary)] animate-pulse">
            {currentStep === 0 && 'Preparazione...'}
            {currentStep === 1 && 'Stiamo cercando annunci simili sul mercato...'}
            {currentStep === 2 && 'Analisi dei prezzi e rimozione anomalie...'}
            {currentStep === 3 && 'Elaborazione della valutazione finale...'}
          </p>
        </div>

        {/* Bottom tip */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Analizziamo centinaia di annunci reali per darti il prezzo giusto
          </p>
        </div>
      </div>
    </div>
  );
}
