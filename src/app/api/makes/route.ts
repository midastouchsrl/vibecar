/**
 * API: Lista marche auto
 * GET /api/makes
 */

import { NextResponse } from 'next/server';
import { CAR_MAKES } from '@/lib/autoscout-data';

export async function GET() {
  return NextResponse.json({
    makes: CAR_MAKES.map((m) => ({
      id: m.id,
      name: m.name,
    })),
  });
}
