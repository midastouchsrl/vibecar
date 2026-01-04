/**
 * OG Image Generator for VibeCar
 * Generates social share cards with valuation data
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

  // Confidence colors
  const confidenceColors: Record<string, { bg: string; text: string; label: string }> = {
    alta: { bg: '#065f46', text: '#34d399', label: 'Alta affidabilità' },
    media: { bg: '#854d0e', text: '#fbbf24', label: 'Media affidabilità' },
    bassa: { bg: '#991b1b', text: '#f87171', label: 'Bassa affidabilità' },
  };

  const conf = confidenceColors[confidence] || confidenceColors.media;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f0f11',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1e1b4b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #0c4a6e 0%, transparent 50%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
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
          <span style={{ color: 'white', fontSize: '28px', fontWeight: 600 }}>VibeCar</span>
        </div>

        {/* Car info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <span style={{ color: 'white', fontSize: '42px', fontWeight: 700 }}>
            {brand} {model}
          </span>
          <span style={{ color: '#9ca3af', fontSize: '24px', marginTop: '8px' }}>
            {year}
          </span>
        </div>

        {/* Price card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '32px 64px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #059669, #0d9488, #0891b2)',
            marginBottom: '24px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', marginBottom: '8px' }}>
            VALORE STIMATO
          </span>
          <span style={{ color: 'white', fontSize: '64px', fontWeight: 700 }}>
            {formatPrice(p50)}
          </span>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px' }}>
              Min: {formatPrice(p25)}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px' }}>
              Max: {formatPrice(p75)}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ color: '#9ca3af', fontSize: '16px' }}>Annunci:</span>
            <span style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>{samples}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9999px',
              background: conf.bg,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                background: conf.text,
              }}
            />
            <span style={{ color: conf.text, fontSize: '16px', fontWeight: 500 }}>
              {conf.label}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
