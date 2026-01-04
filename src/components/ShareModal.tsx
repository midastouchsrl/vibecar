'use client';

/**
 * ShareModal Component
 * Wrapped-style share experience with Story Card + PDF Report
 */

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/robust-stats';
import { generateShareUrl, getEstimateContext } from '@/lib/analytics';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  carInfo: {
    brand: string;
    model: string;
    year: string;
    km: string;
    fuel: string;
  };
  valuation: {
    p25: number;
    p50: number;
    p75: number;
    samples: number;
    confidence: string;
  };
  onShare: (type: 'link' | 'image' | 'whatsapp' | 'pdf') => void;
}

type Tab = 'story' | 'pdf';

export default function ShareModal({
  isOpen,
  onClose,
  carInfo,
  valuation,
  onShare,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('story');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setDownloading(null);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const estimateContext = getEstimateContext();
  const estimateId = estimateContext?.estimate_id || 'unknown';

  const handleCopyLink = async () => {
    const shareUrl = generateShareUrl();
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    onShare('link');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadStoryCard = async () => {
    setDownloading('story');
    onShare('image');

    // Build URL with query params
    const params = new URLSearchParams({
      brand: carInfo.brand,
      model: carInfo.model,
      year: carInfo.year,
      km: carInfo.km,
      fuel: carInfo.fuel,
      p25: valuation.p25.toString(),
      p50: valuation.p50.toString(),
      p75: valuation.p75.toString(),
      samples: valuation.samples.toString(),
      confidence: valuation.confidence,
      estimate_id: estimateId,
      format: 'story', // 1080x1920
    });

    try {
      const response = await fetch(`/api/share-card?${params}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibecar-${carInfo.brand}-${carInfo.model}-story.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }

    setDownloading(null);
  };

  const handleDownloadPDF = async () => {
    setDownloading('pdf');
    onShare('pdf');

    const params = new URLSearchParams({
      brand: carInfo.brand,
      model: carInfo.model,
      year: carInfo.year,
      km: carInfo.km,
      fuel: carInfo.fuel,
      p25: valuation.p25.toString(),
      p50: valuation.p50.toString(),
      p75: valuation.p75.toString(),
      samples: valuation.samples.toString(),
      confidence: valuation.confidence,
      estimate_id: estimateId,
    });

    try {
      const response = await fetch(`/api/share-pdf?${params}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibecar-${carInfo.brand}-${carInfo.model}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
    }

    setDownloading(null);
  };

  const handleWhatsApp = () => {
    onShare('whatsapp');
    const shareUrl = generateShareUrl();
    const text = `Ho valutato la mia ${carInfo.brand} ${carInfo.model} (${carInfo.year}) su VibeCar: ${formatPrice(valuation.p50)} (range ${formatPrice(valuation.p25)} - ${formatPrice(valuation.p75)})`;
    const url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const confidenceLabel = {
    alta: 'Alta affidabilità',
    media: 'Media affidabilità',
    bassa: 'Bassa affidabilità',
  }[valuation.confidence] || valuation.confidence;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--obsidian-800)] rounded-2xl border border-[var(--obsidian-600)] shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--obsidian-600)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Condividi valutazione
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--obsidian-600)] transition-colors"
            aria-label="Chiudi"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--obsidian-600)]">
          <button
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'story'
                ? 'text-[var(--text-primary)] border-b-2 border-emerald-500'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Story Card
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'pdf'
                ? 'text-[var(--text-primary)] border-b-2 border-emerald-500'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Report PDF
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'story' ? (
            <div className="space-y-4">
              {/* Story Card Preview */}
              <div className="relative aspect-[9/16] max-h-[300px] mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
                {/* Preview content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                  <div className="text-xs opacity-70 mb-2">VIBECAR</div>
                  <div className="text-sm font-bold mb-1">{carInfo.brand} {carInfo.model}</div>
                  <div className="text-xs opacity-70 mb-4">{carInfo.year} · {carInfo.km} km</div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 mb-3">
                    <div className="text-xs opacity-70">Valore stimato</div>
                    <div className="text-2xl font-bold">{formatPrice(valuation.p50)}</div>
                  </div>

                  <div className="text-xs opacity-70">
                    Range: {formatPrice(valuation.p25)} - {formatPrice(valuation.p75)}
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="text-[10px] opacity-50">vibecar.it</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] text-center">
                Immagine verticale 1080×1920 — perfetta per Instagram Stories
              </p>

              <button
                onClick={handleDownloadStoryCard}
                disabled={downloading === 'story'}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {downloading === 'story' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Scarica Story Card
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* PDF Preview */}
              <div className="relative aspect-[1/1.414] max-h-[300px] mx-auto rounded-xl overflow-hidden bg-white">
                {/* Preview content */}
                <div className="absolute inset-0 flex flex-col p-4 text-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold text-emerald-600">VIBECAR</div>
                    <div className="text-[8px] text-gray-400">Report valutazione</div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-sm font-bold text-gray-900 mb-1">{carInfo.brand} {carInfo.model}</div>
                    <div className="text-xs text-gray-500 mb-4">
                      {carInfo.year} · {carInfo.km} km · {carInfo.fuel}
                    </div>

                    <div className="bg-emerald-50 rounded-lg px-4 py-3 mb-3 w-full">
                      <div className="text-xs text-emerald-600 mb-1">Valore di mercato</div>
                      <div className="text-xl font-bold text-emerald-700">{formatPrice(valuation.p50)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Range: {formatPrice(valuation.p25)} - {formatPrice(valuation.p75)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full text-left">
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-[8px] text-gray-400">Campione</div>
                        <div className="text-xs font-medium text-gray-700">{valuation.samples} annunci</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-[8px] text-gray-400">Affidabilità</div>
                        <div className="text-xs font-medium text-gray-700">{confidenceLabel}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[8px] text-gray-400 text-center">
                    vibecar.it · Valutazione indicativa
                  </div>
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] text-center">
                Report PDF 1 pagina — ideale per salvare o stampare
              </p>

              <button
                onClick={handleDownloadPDF}
                disabled={downloading === 'pdf'}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {downloading === 'pdf' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Scarica Report PDF
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer with quick actions */}
        <div className="p-4 border-t border-[var(--obsidian-600)] bg-[var(--obsidian-900)]">
          <div className="grid grid-cols-2 gap-3">
            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--obsidian-700)] hover:bg-[var(--obsidian-600)] border border-[var(--obsidian-500)] text-sm font-medium text-[var(--text-primary)] transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-emerald-400">Copiato!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 6.364l4.5 4.5a4.5 4.5 0 006.364 0l1.757-1.757" />
                  </svg>
                  Copia link
                </>
              )}
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-sm font-medium text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
