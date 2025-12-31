# VibeCar 🚗

**Valutazione gratuita per auto usate in Italia**

VibeCar è un'applicazione web che stima il valore di mercato di un'auto usata analizzando annunci reali online. Fornisce un range di prezzo, la mediana di mercato e una stima del prezzo d'acquisto per concessionari.

## 🚀 Quick Start

```bash
# Installa dipendenze
npm install

# Avvia in sviluppo
npm run dev

# Apri http://localhost:3000
```

## 📋 Funzionalità

### Form di Valutazione
- **Marca e modello**: Selezione da lista marche italiane più comuni
- **Anno e chilometraggio**: Range validati
- **Alimentazione e cambio**: Filtri per tipo carburante e trasmissione
- **Regione**: Tutte le regioni italiane
- **Condizione** (opzionale): Scarsa (-7%), Normale, Ottima (+5%)

### Risultati
- **Range di valore**: Min (P25) - Max (P75)
- **Mediana di mercato**: Prezzo centrale
- **Prezzo dealer**: Stima acquisto concessionario (mediana × 0.86)
- **Numero campioni**: Quanti annunci analizzati
- **Confidenza**: Alta/Media/Bassa basata su samples e dispersione
- **Spiegazione**: Descrizione in italiano di come è stata calcolata

## 🔧 Stack Tecnico

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Jest** per i test

Nessun database richiesto. Caching in-memory LRU + HTTP cache headers.

## 📁 Struttura Progetto

```
vibecar/
├── src/
│   ├── app/
│   │   ├── api/valuate/     # API endpoint POST
│   │   ├── risultato/       # Pagina risultati
│   │   └── page.tsx         # Homepage con form
│   ├── components/
│   │   ├── ValuationForm.tsx
│   │   └── ValuationResult.tsx
│   └── lib/
│       ├── types.ts         # TypeScript types
│       ├── config.ts        # Configurazione
│       ├── stats.ts         # Funzioni statistiche
│       ├── cache.ts         # LRU cache
│       ├── datasource.ts    # Fetch annunci
│       └── valuation.ts     # Orchestrazione
├── __tests__/
│   └── stats.test.ts        # Unit tests
├── fixtures/
│   └── sample-listings.json # Dati test
└── README.md
```

## 🧮 Logica di Valutazione

1. **Fetch annunci**: Cerca auto simili (±1 anno, ±30% km)
2. **Pulizia dati**: Rimuove outlier (P10-P90)
3. **Statistiche**: Calcola mediana, P25, P75, IQR
4. **Aggiustamento condizione**: Applica bonus/malus
5. **Prezzo dealer**: Mediana × 0.86, arrotondato a €50
6. **Confidenza**:
   - Alta: ≥40 samples + IQR/mediana ≤20%
   - Media: ≥20 samples
   - Bassa: <20 samples

## 🧪 Test

```bash
# Esegui tutti i test
npm test

# Watch mode
npm run test:watch

# Con coverage
npm run test:coverage
```

## 🌐 API

### POST /api/valuate

**Request:**
```json
{
  "brand": "Fiat",
  "model": "Panda",
  "year": 2020,
  "km": 50000,
  "fuel": "benzina",
  "gearbox": "manuale",
  "region": "Lombardia",
  "condition": "normale"
}
```

**Response (successo):**
```json
{
  "range_min": 10500,
  "range_max": 13200,
  "market_median": 11900,
  "dealer_buy_price": 10250,
  "samples": 25,
  "confidence": "media",
  "explanation": "Valutazione basata su 25 annunci...",
  "computed_from": {
    "region": "Lombardia",
    "year_window": [2019, 2021],
    "km_window": [35000, 65000],
    "filters_applied": ["Anno: 2019-2021", "Km: 35.000-65.000"]
  }
}
```

## ⚙️ Configurazione

Tutti i parametri sono configurabili in `src/lib/config.ts`:

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| yearWindow | 1 | ±anni da cercare |
| kmWindowPercent | 0.30 | ±% km |
| dealerDiscountPercent | 0.14 | Sconto dealer |
| conditionAdjustments.scarsa | -0.07 | Malus scarsa |
| conditionAdjustments.ottima | 0.05 | Bonus ottima |

## 🚧 Limitazioni Note

1. **Singola fonte dati**: Solo AutoScout24 (MVP)
2. **Nessun database**: Cache solo in-memory
3. **Rate limiting**: Possibili blocchi con uso intensivo
4. **Regione approssimativa**: Cerca in Italia se regione non disponibile
5. **No VIN decoding**: Non verifica specifiche da telaio

## 🔮 Prossimi Sviluppi

- [ ] Multi-source: Subito.it, AutoTrader
- [ ] Database persistente (SQLite/PostgreSQL)
- [ ] VIN decoding per specifiche esatte
- [ ] Storico prezzi e trend
- [ ] API rate limiting e quota
- [ ] PWA per uso offline

## 📝 Deploy

### Vercel (consigliato)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["npm", "start"]
```

### Manuale
```bash
npm run build
npm start
```

## 📄 Licenza

MIT - Uso libero per progetti personali e commerciali.

---

**Disclaimer**: VibeCar fornisce stime indicative basate su dati pubblici. I valori reali possono variare in base a condizioni specifiche del veicolo, optional, storico manutenzioni e altri fattori. Non costituisce offerta di acquisto o vendita.
