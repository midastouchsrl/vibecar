/**
 * Share Card Generator for VibeCar
 * Generates story-format images (1080x1920) for Instagram Stories
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

  // Confidence config
  const confidenceConfig: Record<string, { bg: string; text: string; label: string }> = {
    alta: { bg: '#065f46', text: '#34d399', label: 'Alta affidabilità' },
    media: { bg: '#854d0e', text: '#fbbf24', label: 'Media affidabilità' },
    bassa: { bg: '#991b1b', text: '#f87171', label: 'Bassa affidabilità' },
  };

  const conf = confidenceConfig[confidence] || confidenceConfig.media;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #0f0f11 0%, #1a1a2e 50%, #0f0f11 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Header with logo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '80px',
            paddingBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <span style={{ color: 'white', fontSize: '36px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              VibeCar
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 60px' }}>
          {/* Car info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '48px',
            }}
          >
            <span
              style={{
                color: '#9ca3af',
                fontSize: '24px',
                textTransform: 'uppercase',
                letterSpacing: '4px',
                marginBottom: '16px',
              }}
            >
              Valutazione
            </span>
            <span
              style={{
                color: 'white',
                fontSize: '56px',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.1,
              }}
            >
              {brand} {model}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '20px',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '28px' }}>{year}</span>
              <span style={{ color: '#374151', fontSize: '28px' }}>•</span>
              <span style={{ color: '#6b7280', fontSize: '28px' }}>{formatKm(km)}</span>
              {fuel && (
                <>
                  <span style={{ color: '#374151', fontSize: '28px' }}>•</span>
                  <span style={{ color: '#6b7280', fontSize: '28px', textTransform: 'capitalize' }}>{fuel}</span>
                </>
              )}
            </div>
          </div>

          {/* Main price card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 80px',
              borderRadius: '32px',
              background: 'linear-gradient(135deg, #059669, #0d9488, #0891b2)',
              marginBottom: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '22px',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '12px',
              }}
            >
              Prezzo consigliato
            </span>
            <span
              style={{
                color: 'white',
                fontSize: '80px',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {formatPrice(p50)}
            </span>
          </div>

          {/* Range */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              marginBottom: '48px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '20px', marginBottom: '4px' }}>Minimo</span>
              <span style={{ color: '#60a5fa', fontSize: '36px', fontWeight: 600 }}>{formatPrice(p25)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '20px', marginBottom: '4px' }}>Massimo</span>
              <span style={{ color: '#fbbf24', fontSize: '36px', fontWeight: 600 }}>{formatPrice(p75)}</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 24px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.1)',
              }}
            >
              <span style={{ color: '#9ca3af', fontSize: '22px' }}>Campione:</span>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: 600 }}>{samples} annunci</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 24px',
                borderRadius: '9999px',
                background: conf.bg,
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '9999px',
                  background: conf.text,
                }}
              />
              <span style={{ color: conf.text, fontSize: '22px', fontWeight: 500 }}>
                {conf.label}
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: '80px',
            paddingTop: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ color: '#9ca3af', fontSize: '24px' }}>Valuta anche la tua su</span>
            <span style={{ color: '#10b981', fontSize: '24px', fontWeight: 600 }}>vibecar.it</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
