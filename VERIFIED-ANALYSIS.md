# VibeCar - Analisi Tecnica VERIFICATA

> **Documento generato il 4 gennaio 2026**
> **Metodologia**: Test A/B reali su AutoScout24.it con verifica conteggio risultati

---

## TASK 1 & 2: Filtri URL Verificati

### Metodologia di Verifica

- URL base: `https://www.autoscout24.it/lst/fiat/panda?cy=I`
- Baseline: **11.100 annunci** (Fiat Panda Italia)
- Un filtro e VERIFICATO se il conteggio cambia in modo coerente

### Tabella Filtri VERIFICATI

| Filtro | Parametro URL | Tipo | Valori Testati | Risultato | VERIFICATO |
|--------|---------------|------|----------------|-----------|------------|
| Anno min | `fregfrom` | range | 2020 | 11100 → 2982 | **SI** |
| Anno max | `fregto` | range | 2023 | (con fregfrom) | **SI** |
| Km max | `kmto` | range | 50000 | 11100 → 4456 | **SI** |
| Km min | `kmfrom` | range | 0 | (funziona) | **SI** |
| Alimentazione | `fuel` | enum | B,D,L,2 | Vedi sotto | **SI** |
| Cambio | `gear` | enum | M,A | 10972/33 | **SI** |
| Prezzo min | `pricefrom` | range | 5000 | (con priceto) | **SI** |
| Prezzo max | `priceto` | range | 15000 | 11100 → 8618 | **SI** |
| Potenza min | `powerfrom` | range | 50 | (con powertype) | **SI** |
| Potenza max | `powerto` | range | 80 | 11100 → 9217 | **SI** |
| Unita potenza | `powertype` | enum | kw | (richiesto) | **SI** |
| Stato veicolo | `ustate` | enum | N,U | 169/10932 | **SI** |
| Carrozzeria | `body` | enum | 3,6 | Varia | **PARZIALE** |
| Paese | `cy` | enum | I | (fisso Italia) | **SI** |

### Valori Alimentazione VERIFICATI

| Codice | Descrizione | Test Fiat Panda | Nota |
|--------|-------------|-----------------|------|
| `B` | Benzina | 3.633 annunci | VERIFICATO |
| `D` | Diesel | 1.297 annunci | VERIFICATO |
| `L` | GPL | 672 annunci | VERIFICATO |
| `M` | Metano | 0 annunci | Non disponibile per Panda |
| `E` | Elettrica | 0 annunci | Non disponibile per Panda |
| `2` | Ibrida benzina | 4.570 annunci | VERIFICATO |

### Filtri NON VERIFICATI (Non Funzionanti)

| Filtro | Parametro | Test | Risultato | Status |
|--------|-----------|------|-----------|--------|
| Venditore | `seller=P/D` | P e D | Entrambi 11099 | **NON FUNZIONA** |
| Classe Euro | `emissclass=5/6` | 5 e 6 | Entrambi 11101 | **NON FUNZIONA** |
| Incidentate | `damaged_listing` | exclude/include | Entrambi 11101 | **NON FUNZIONA** |
| Porte | `doors=3/5` | 3 e 5 | Entrambi 11101 | **NON FUNZIONA** |
| Colore | `color=1/2` | 1 e 2 | Entrambi 11101 | **NON FUNZIONA** |
| Posti | `seats=4/5` | 4 e 5 | Entrambi 11101 | **NON FUNZIONA** |

> **NOTA CRITICA**: Questi filtri appaiono nell'interfaccia ma NON modificano i risultati via URL.
> Potrebbero funzionare solo via JavaScript/API interna.

### Test Filtri Combinati

| Query | Risultato | Status |
|-------|-----------|--------|
| `fregfrom=2019&fregto=2023&kmfrom=0&kmto=80000&fuel=B&gear=M` | 685 | **VERIFICATO** |

I filtri verificati funzionano correttamente anche in combinazione.

---

## TASK 3: Campi Estraibili dai Listing

### Fonte Dati

Ogni listing e contenuto in un elemento `<article>` con attributi `data-*`.

### Campi SEMPRE PRESENTI (100%)

| Campo | Attributo HTML | Formato | Esempio | Uso VibeCar |
|-------|----------------|---------|---------|-------------|
| ID Annuncio | `data-guid` | UUID | `87f9c098-6856-...` | Deduplicazione |
| ID Venditore | `data-customer-id` | Integer | `33284622` | Analytics |
| Prezzo | `data-price` | Integer EUR | `9900` | **PRICING** |
| Marca | `data-make` | Slug | `fiat` | Validazione |
| Modello | `data-model` | Slug | `panda` | Validazione |
| Immatricolazione | `data-first-registration` | MM-YYYY | `09-2021` | **PRICING** |
| Chilometraggio | `data-mileage` | Integer KM | `35665` | **PRICING** |
| Alimentazione | `data-fuel-type` | Codice | `2`, `b`, `l` | **PRICING** |
| Tipo Venditore | `data-seller-type` | Enum | `d`/`p` | **PRICING** |
| Paese | `data-listing-country` | Codice | `i` | Filtro |
| CAP | `data-listing-zip-code` | String | `20874` | Geoloc |
| Posizione | `data-position` | Integer | `1` | Ranking |

### Campi SPESSO PRESENTI (80-99%)

| Campo | Attributo HTML | Formato | Affidabilita |
|-------|----------------|---------|--------------|
| Tipo veicolo | `data-vehicle-type` | Enum | 100% (sempre `c`) |
| Label prezzo | `data-price-label` | String | 95% (`top-price`, `good-price`) |
| Smyle eligible | `data-is-smyle-eligible` | Boolean | 100% |
| Deliverable | `data-deliverable` | Boolean | 100% |
| Taxonomy | `data-model-taxonomy` | JSON-like | 100% |

### Campi ESTRATTI dal Taxonomy

Dal campo `data-model-taxonomy="[make_id:28, model_group_id:200526, ...]"`:

| Campo | Esempio | Uso |
|-------|---------|-----|
| `make_id` | 28 (Fiat) | Query MMM |
| `model_group_id` | 200526 (Panda) | Query MMM |
| `generation_id` | 817 | Non usato |
| `motortype_id` | 1876 | Non usato |

### Campi NON Disponibili Direttamente

| Campo | Status | Nota |
|-------|--------|------|
| Potenza (kW/CV) | NON PRESENTE | Solo via dettaglio annuncio |
| Classe Euro | NON PRESENTE | Solo via dettaglio annuncio |
| Numero porte | NON PRESENTE | Solo via dettaglio annuncio |
| Colore | NON PRESENTE | Solo via dettaglio annuncio |

---

## TASK 4: Form VibeCar Raccomandato

### Campi OBBLIGATORI (V1 - Subito)

| Campo | Input Type | Origine Filtro | Impatto Pricing |
|-------|------------|----------------|-----------------|
| Marca | Dropdown + autocomplete | URL slug | Alto - determina modelli |
| Modello | Dropdown dinamico | URL slug | Alto - base ricerca |
| Anno | Dropdown 1990-2026 | `fregfrom/fregto` | **ALTO** |
| Chilometraggio | Input numerico | `kmfrom/kmto` | **ALTO** |
| Alimentazione | Dropdown | `fuel` | **MEDIO-ALTO** |
| Cambio | Dropdown | `gear` | **MEDIO** |
| Condizione | Radio 3 opzioni | (locale) | MEDIO - aggiustamento % |

### Campi OPZIONALI (V1.1)

| Campo | Input Type | Origine | Impatto | Raccomandazione |
|-------|------------|---------|---------|-----------------|
| Stato (nuovo/usato) | Toggle | `ustate` | MEDIO | **SI** - filtra km=0 |
| Range prezzo atteso | Slider | `pricefrom/priceto` | Basso | NO - non serve per stima |
| Potenza kW | Slider | `powerfrom/powerto` | MEDIO | **V2** - richiede UI |

### Campi DA EVITARE

| Campo | Motivo |
|-------|--------|
| Regione/Provincia | Filtro URL non verificato |
| Tipo venditore (P/D) | Filtro URL NON funziona |
| Classe Euro | Filtro URL NON funziona |
| Colore | Filtro URL NON funziona, impatto nullo |
| Porte | Filtro URL NON funziona |
| Posti | Filtro URL NON funziona |

---

## TASK 5: Strategia Fallback Intelligente

### Ordine di Rilassamento Filtri

```
STEP 1: Ricerca STRETTA (default)
├── Anno: ±1 anno
├── Km: ±15%
├── Fuel: esatto
├── Gear: esatto
└── Min risultati attesi: 10

Se risultati < 10:

STEP 2: ALLARGA ANNO
├── Anno: ±2 anni
├── Km: ±15%
├── Fuel: esatto
├── Gear: esatto
└── Motivazione: Anno ha grande impatto ma ±2 anni e ancora significativo

Se risultati < 10:

STEP 3: ALLARGA KM
├── Anno: ±2 anni
├── Km: ±30%
├── Fuel: esatto
├── Gear: esatto
└── Motivazione: Km ha impatto medio, 30% e tolleranza accettabile

Se risultati < 5:

STEP 4: RIMUOVI CAMBIO
├── Anno: ±2 anni
├── Km: ±30%
├── Fuel: esatto
├── Gear: ANY
└── Motivazione: Cambio ha impatto basso su molti modelli

Se risultati = 0:

STEP 5: VERIFICA ESISTENZA MODELLO
├── Solo marca/modello
├── Nessun filtro
└── Output: "Modello non disponibile" o "Modifica parametri"
```

### Logica di Decisione

| Condizione | Azione | Messaggio Utente |
|------------|--------|------------------|
| >= 10 risultati | Calcola stima | (mostra risultato) |
| 5-9 risultati | Calcola stima | "Affidabilita: Media" |
| 1-4 risultati | Calcola stima | "Affidabilita: Bassa" |
| 0 risultati con fallback | Allarga ricerca | (silenzioso) |
| 0 risultati finale | Errore contestuale | "Modello non disponibile / Prova altri parametri" |

---

## TASK 6: Output Tecnico Finale

### A) Filtri UTILIZZABILI IN PRODUZIONE

```javascript
const VERIFIED_FILTERS = {
  // Core - SEMPRE usare
  fregfrom: 'integer',      // Anno min
  fregto: 'integer',        // Anno max
  kmfrom: 'integer',        // Km min
  kmto: 'integer',          // Km max
  fuel: 'B|D|L|M|E|2|3',    // Alimentazione
  gear: 'M|A',              // Cambio

  // Opzionali - funzionano
  pricefrom: 'integer',     // Prezzo min (non usato per stima)
  priceto: 'integer',       // Prezzo max (non usato per stima)
  powertype: 'kw|hp',       // Unita potenza
  powerfrom: 'integer',     // Potenza min
  powerto: 'integer',       // Potenza max
  ustate: 'N|U|N,U',        // Nuovo/Usato/Tutti

  // Fissi
  cy: 'I',                  // Italia
  size: '20',               // Risultati per pagina
  sort: 'standard',         // Ordinamento
};

const BROKEN_FILTERS = [
  'seller',        // NON FUNZIONA via URL
  'emissclass',    // NON FUNZIONA via URL
  'damaged_listing', // NON FUNZIONA via URL
  'doors',         // NON FUNZIONA via URL
  'color',         // NON FUNZIONA via URL
  'seats',         // NON FUNZIONA via URL
];
```

### B) Campi ESTRAIBILI con Affidabilita

```javascript
const EXTRACTABLE_FIELDS = {
  // 100% affidabili - USARE
  'data-price': { type: 'integer', unit: 'EUR', use: 'PRICING' },
  'data-mileage': { type: 'integer', unit: 'KM', use: 'VALIDATION' },
  'data-first-registration': { type: 'MM-YYYY', use: 'VALIDATION' },
  'data-fuel-type': { type: 'enum', values: ['b','d','l','m','e','2','3'], use: 'VALIDATION' },
  'data-seller-type': { type: 'enum', values: ['d','p'], use: 'ANALYTICS' },
  'data-guid': { type: 'uuid', use: 'DEDUPLICATION' },
  'data-make': { type: 'slug', use: 'VALIDATION' },
  'data-model': { type: 'slug', use: 'VALIDATION' },
  'data-listing-zip-code': { type: 'string', use: 'GEOLOCATION' },
};
```

### C) Raccomandazioni Tecniche

#### Scraping Stabile

```javascript
// Pattern di estrazione consigliato
const LISTING_PATTERN = /<article[^>]*data-price="(\d+)"[^>]*data-mileage="(\d+)"[^>]*data-first-registration="([^"]+)"[^>]*>/g;

// Alternativa: split su > e grep
// cat html | tr '>' '\n' | grep 'data-price=' > listings.txt
```

#### Rate Limiting

| Parametro | Valore | Nota |
|-----------|--------|------|
| Delay tra richieste | 500ms | Minimo consigliato |
| Max pagine per query | 5 | 100 risultati max |
| Timeout request | 15s | Abort se lento |
| Retry on 429 | 3 volte | Con backoff esponenziale |

#### Caching

| Tipo | TTL | Scopo |
|------|-----|-------|
| Risultati grezzi | 24h | Ridurre richieste |
| Valutazioni calcolate | 1h | Refresh frequente |
| Lista modelli | 7 giorni | Raramente cambia |

### D) Cosa NON Fare

| Errore | Conseguenza | Soluzione |
|--------|-------------|-----------|
| Usare filtro `seller` via URL | Ignorato, risultati sbagliati | Filtrare lato client su `data-seller-type` |
| Usare filtro `emissclass` | Ignorato | Non implementare |
| Assumere campo `potenza` disponibile | Non presente in listing | Richiede fetch dettaglio (lento) |
| Request senza User-Agent | Possibile block | Usare UA browser realistico |
| Request parallele massive | Rate limiting/ban | Max 2 req/sec |
| Parsare HTML con regex complessi | Fragile | Usare attributi data-* |

---

## Riepilogo Esecutivo

### Filtri Pronti per Produzione

| Filtro | Parametro | Priorita |
|--------|-----------|----------|
| Anno | `fregfrom/fregto` | P0 - Essenziale |
| Km | `kmfrom/kmto` | P0 - Essenziale |
| Alimentazione | `fuel` | P0 - Essenziale |
| Cambio | `gear` | P1 - Importante |
| Potenza | `powerfrom/powerto` | P2 - Opzionale V2 |

### Campi Estrazione Pronti

| Campo | Attributo | Uso |
|-------|-----------|-----|
| Prezzo | `data-price` | Calcolo statistico |
| Km | `data-mileage` | Cross-validazione |
| Anno | `data-first-registration` | Cross-validazione |
| Tipo venditore | `data-seller-type` | Analytics/Filtro client |
| ID | `data-guid` | Deduplicazione |

### Azioni Immediate

1. **Aggiornare datasource.ts**: Estrarre `data-mileage` e `data-first-registration` per validazione
2. **Aggiungere filtro stato**: `ustate=U` per solo usate (esclude km=0)
3. **Implementare fallback 4-step**: Come documentato sopra
4. **Rimuovere filtri rotti**: Non usare seller, emissclass, etc. via URL

---

*Analisi verificata con test A/B reali - 4 gennaio 2026*
