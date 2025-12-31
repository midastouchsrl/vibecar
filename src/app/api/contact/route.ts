/**
 * API Route: POST /api/contact
 * Endpoint per richieste di contatto vendita auto
 */

import { NextRequest, NextResponse } from 'next/server';

interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  car: string;
  valuation: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json();

    // Validazione base
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        {
          error: true,
          message: 'Tutti i campi sono obbligatori',
        },
        { status: 400 }
      );
    }

    // Validazione email semplice
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          error: true,
          message: 'Email non valida',
        },
        { status: 400 }
      );
    }

    // Log della richiesta (in produzione, inviare email/salvare su DB)
    console.log('[CONTACT] Nuova richiesta:', {
      name: body.name,
      email: body.email,
      phone: body.phone,
      car: body.car,
      valuation: body.valuation,
      timestamp: new Date().toISOString(),
    });

    // Qui puoi aggiungere:
    // - Invio email con nodemailer o servizio esterno
    // - Salvataggio su database
    // - Integrazione con CRM
    // - Notifica Telegram/Slack

    return NextResponse.json({
      success: true,
      message: 'Richiesta inviata con successo',
    });
  } catch (error) {
    console.error('[CONTACT] Errore:', error);

    return NextResponse.json(
      {
        error: true,
        message: 'Errore durante l\'invio della richiesta',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API Contact attiva. Usa POST per inviare una richiesta.',
  });
}
