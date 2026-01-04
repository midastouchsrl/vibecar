/**
 * Share PDF/Report Generator for VibeCar
 * Generates a document-style image (A4-like ratio) that can be saved/printed
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get params from URL
  const brand = searchParams.get('brand') || 'Auto';
  const model = searchParams.get('model') || '';
  const year = searchParams.get('year') || '';
  const km = searchParams.get('km') || '0';
  const fuel = searchParams.get('fuel') || '';
  const p50 = searchParams.get('p50') || '0';
  const p25 = searchParams.get('p25') || '0';
  const p75 = searchParams.get('p75') || '0';
  const samples = searchParams.get('samples') || '0';
  const confidence = searchParams.get('confidence') || 'media';
  const estimateId = searchParams.get('estimate_id') || '';

  // Format price
  const formatPrice = (price: string) => {
    const num = parseInt(price, 10);
    if (isNaN(num)) return '€ 0';
    return `€ ${num.toLocaleString('it-IT')}`;
  };

  // Format km
  const formatKm = (kmStr: string) => {
    const num = parseInt(kmStr.replace(/\D/g, ''), 10);
    if (isNaN(num)) return '0 km';
    return `${num.toLocaleString('it-IT')} km`;
  };

  // Date
  const today = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Confidence config
  const confidenceConfig: Record<string, { bg: string; text: string; label: string }> = {
    alta: { bg: '#dcfce7', text: '#166534', label: 'Alta affidabilità' },
    media: { bg: '#fef9c3', text: '#854d0e', label: 'Media affidabilità' },
    bassa: { bg: '#fee2e2', text: '#991b1b', label: 'Bassa affidabilità' },
  };

  const conf = confidenceConfig[confidence] || confidenceConfig.media;

  // A4 ratio dimensions (roughly 1:1.414)
  const width = 1080;
  const height = 1527;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '40px',
            paddingBottom: '24px',
            borderBottom: '2px solid #e5e7eb',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#111827', fontSize: '28px', fontWeight: 700 }}>VibeCar</span>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Report valutazione veicolo</span>
            </div>
          </div>

          {/* Date & ID */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>{today}</span>
            {estimateId && (
              <span style={{ color: '#9ca3af', fontSize: '12px', fontFamily: 'monospace' }}>
                ID: {estimateId.slice(0, 8)}
              </span>
            )}
          </div>
        </div>

        {/* Vehicle info */}
        <div style={{ marginBottom: '40px' }}>
          <span style={{ color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Veicolo valutato
          </span>
          <h1 style={{ color: '#111827', fontSize: '42px', fontWeight: 700, margin: '8px 0' }}>
            {brand} {model}
          </h1>
          <div style={{ display: 'flex', gap: '24px', color: '#6b7280', fontSize: '18px' }}>
            <span>Anno: {year}</span>
            <span>Chilometraggio: {formatKm(km)}</span>
            {fuel && <span>Alimentazione: {fuel}</span>}
          </div>
        </div>

        {/* Main value card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '40px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)',
            border: '2px solid #10b981',
            marginBottom: '32px',
          }}
        >
          <span style={{ color: '#065f46', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            Valore di mercato stimato
          </span>
          <span style={{ color: '#059669', fontSize: '64px', fontWeight: 700, lineHeight: 1 }}>
            {formatPrice(p50)}
          </span>
          <div style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Valore minimo (P25)</span>
              <span style={{ color: '#3b82f6', fontSize: '28px', fontWeight: 600 }}>{formatPrice(p25)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Valore massimo (P75)</span>
              <span style={{ color: '#f59e0b', fontSize: '28px', fontWeight: 600 }}>{formatPrice(p75)}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          {/* Sample size */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              borderRadius: '16px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
            }}
          >
            <span style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Campione analizzato</span>
            <span style={{ color: '#111827', fontSize: '32px', fontWeight: 700 }}>{samples}</span>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>annunci reali simili</span>
          </div>

          {/* Confidence */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              borderRadius: '16px',
              background: conf.bg,
              border: '1px solid #e5e7eb',
            }}
          >
            <span style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Affidabilità stima</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: conf.text,
                }}
              />
              <span style={{ color: conf.text, fontSize: '24px', fontWeight: 600 }}>{conf.label}</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            marginBottom: '40px',
          }}
        >
          <span style={{ color: '#111827', fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
            Come leggere questa valutazione
          </span>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Il valore centrale rappresenta la mediana dei prezzi di mercato per veicoli simili.
            Il range P25-P75 indica l&apos;intervallo in cui si trova il 50% degli annunci analizzati.
            Questa è una stima indicativa basata su dati pubblici di mercato.
          </p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>
              Valutazione generata automaticamente
            </span>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>
              Non costituisce un&apos;offerta di acquisto
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '18px', fontWeight: 600 }}>vibecar.it</span>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}
