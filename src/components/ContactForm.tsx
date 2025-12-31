'use client';

/**
 * Contact Form for selling the car
 * Premium form with persuasive copy
 */

import { useState, FormEvent } from 'react';

interface Props {
  carInfo: {
    brand: string;
    model: string;
    year: string;
    km: string;
  };
  valuation: {
    range_min: number;
    range_max: number;
  };
}

export default function ContactForm({ carInfo, valuation }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          car: `${carInfo.brand} ${carInfo.model} ${carInfo.year} - ${carInfo.km} km`,
          valuation: `${valuation.range_min.toLocaleString('it-IT')}€ - ${valuation.range_max.toLocaleString('it-IT')}€`,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.message || 'Errore durante l\'invio. Riprova.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Errore di connessione. Riprova.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Richiesta inviata!
        </h3>
        <p className="text-[var(--text-secondary)] text-sm">
          Ti contatteremo al pi&ugrave; presto per discutere la vendita della tua auto.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 opacity-0 animate-fade-in-up animate-delay-400">
      {/* Header with icon */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-6 h-6 text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Vuoi vendere la tua auto?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
            Lascia i tuoi dati e riceverai un&apos;offerta concreta entro 24 ore.
            Nessun impegno, massima trasparenza.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-xs">Nome e cognome</label>
          <input
            type="text"
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mario Rossi"
            required
            className="!py-3"
          />
        </div>

        {/* Email and Phone in row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="contact-email" className="text-xs">Email</label>
            <input
              type="email"
              id="contact-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mario@email.com"
              required
              className="!py-3"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-phone" className="text-xs">Telefono</label>
            <input
              type="tel"
              id="contact-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+39 333 1234567"
              required
              className="!py-3"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-[var(--error-muted)] border border-[var(--error)]/30">
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 !mt-6"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Invio in corso...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
              <span>Richiedi valutazione gratuita</span>
            </>
          )}
        </button>

        {/* Privacy note */}
        <p className="text-xs text-[var(--text-muted)] text-center mt-4">
          Inviando accetti la nostra{' '}
          <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline">
            privacy policy
          </a>
        </p>
      </form>
    </div>
  );
}
