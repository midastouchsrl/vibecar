# VibeCar - Documento di Presentazione

## Cos'e VibeCar

**VibeCar** e un'applicazione web gratuita che permette agli utenti di ottenere una **valutazione istantanea** del valore di mercato della propria auto usata. L'app analizza in tempo reale gli annunci presenti su AutoScout24 Italia e fornisce una stima basata su dati statistici reali.

**URL**: https://vibecar.it / https://www.vibecar.it

---

## Problema che Risolve

Quando un proprietario vuole vendere la propria auto usata, si trova di fronte a domande comuni:
- "Quanto vale realmente la mia auto?"
- "A che prezzo la posso mettere in vendita?"
- "Quanto mi offrirebbe un concessionario?"

Attualmente le alternative sono:
1. **Cercare manualmente** annunci simili su vari portali (lungo e impreciso)
2. **Chiedere a un concessionario** (spesso sottostimano per margine)
3. **Usare servizi a pagamento** di valutazione professionale

VibeCar offre una **risposta immediata, gratuita e basata su dati reali di mercato**.

---

## Come Funziona (Flusso Utente)

### Step 1: Inserimento Dati
L'utente compila un form con:
- **Marca** (dropdown con 41 marche supportate)
- **Modello** (caricato dinamicamente in base alla marca)
- **Anno di immatricolazione** (1992-2026)
- **Chilometraggio**
- **Alimentazione** (Benzina, Diesel, GPL, Metano, Ibrida, Elettrica)
- **Cambio** (Manuale, Automatico)
- **Condizione veicolo** (Scarsa, Normale, Ottima)

### Step 2: Elaborazione
In pochi secondi l'app:
1. Cerca annunci simili su AutoScout24 Italia
2. Filtra per anno (+/-1-2 anni) e chilometraggio (+/-15-30%)
3. Raccoglie i prezzi di vendita
4. Rimuove gli outlier (prezzi anomali)
5. Calcola statistiche (mediana, percentili)
6. Applica aggiustamenti per condizione

### Step 3: Risultato
L'utente riceve:
- **Range di prezzo** (minimo - massimo realistico)
- **Mediana di mercato** (prezzo centrale)
- **Prezzo dealer** (stima di quanto offrirebbe un concessionario, circa -14%)
- **Livello di affidabilita** (Alta/Media/Bassa basato su quanti annunci trovati)
- **Spiegazione** di come e stata calcolata la valutazione

### Step 4: Contatto (Opzionale)
L'utente puo compilare un form di contatto per essere richiamato (lead generation).

---

## Funzionalita Tecniche

### Ricerca Intelligente con Fallback
- **Prima ricerca**: criteri stretti (+/-1 anno, +/-15% km)
- **Se pochi risultati**: allarga automaticamente (+/-2 anni, +/-30% km)
- **Se zero risultati**: verifica se il modello esiste in Italia e fornisce feedback contestuale

### Messaggi di Errore Contestuali
- "Nessun Tesla Cybertruck trovato in Italia" -> modello non disponibile
- "Esistono 15 annunci ma con anno/km diversi" -> suggerisce di modificare i parametri

### Calcolo Statistico Robusto
- Rimozione outlier (esclude il 10% piu basso e piu alto)
- Calcolo percentili (P25, P50, P75)
- IQR (Interquartile Range) per misurare l'omogeneita dei prezzi

### Aggiustamenti per Condizione
| Condizione | Aggiustamento |
|------------|---------------|
| Scarsa | -7% |
| Normale | 0% |
| Ottima | +5% |

### Prezzo Dealer
Stima del prezzo che un concessionario offrirebbe: **mediana - 14%** (arrotondato a 50 euro)

### Sistema di Affidabilita
| Livello | Criteri |
|---------|---------|
| Alta | >=40 annunci + prezzi omogenei (IQR/mediana <=20%) |
| Media | >=20 annunci |
| Bassa | <20 annunci |

---

## Fonte Dati

**AutoScout24 Italia** (autoscout24.it)
- Il piu grande portale di annunci auto in Europa
- Dati sempre aggiornati in tempo reale
- Copertura di tutte le marche e modelli sul mercato italiano

---

## Marche Supportate (41)

Abarth, Alfa Romeo, Audi, BMW, Chevrolet, Citroen, Cupra, Dacia, DS, Ferrari, Fiat, Ford, Honda, Hyundai, Jaguar, Jeep, Kia, Lamborghini, Lancia, Land Rover, Lexus, Maserati, Mazda, Mercedes-Benz, Mini, Mitsubishi, Nissan, Opel, Peugeot, Porsche, Renault, Seat, Skoda, Smart, Subaru, Suzuki, Tesla, Toyota, Volkswagen, Volvo

---

## Target Utenti

### Primario
- **Privati che vogliono vendere** la propria auto
- **Privati che vogliono comprare** e verificare se un prezzo e giusto
- **Persone in fase di valutazione** del cambio auto

### Secondario
- **Piccoli rivenditori** che vogliono un riferimento di mercato rapido
- **Concessionari** per verifiche veloci
- **Assicurazioni/Periti** per stime indicative

---

## Punti di Forza

1. **Gratuito** - Nessun costo, nessuna registrazione
2. **Istantaneo** - Risultato in 3-5 secondi
3. **Basato su dati reali** - Non stime teoriche ma annunci veri
4. **Trasparente** - Mostra quanti annunci ha analizzato e come
5. **Mobile-friendly** - Funziona perfettamente da smartphone
6. **Nessuna pubblicita invasiva** - UX pulita e professionale
7. **Dark mode** - Supporto tema scuro/chiaro

---

## Limitazioni Attuali

1. **Solo mercato italiano** - Dati solo da AutoScout24 Italia
2. **Solo auto** - Non moto, camper, veicoli commerciali
3. **Dipendenza da AutoScout24** - Se il sito cambia struttura, richiede aggiornamenti
4. **Nessuno storico** - Non traccia l'andamento dei prezzi nel tempo
5. **Nessun account utente** - Non salva le ricerche precedenti

---

## Possibili Sviluppi Futuri

### Breve Termine
- Storico valutazioni (salvare e confrontare nel tempo)
- Notifiche prezzo (avvisami quando scende sotto X)
- Confronto con altri modelli simili

### Medio Termine
- Espansione ad altri mercati europei (DE, FR, ES)
- App mobile nativa (iOS/Android)
- API per integrazioni B2B
- Dashboard per dealer/concessionari

### Lungo Termine
- Predizione trend prezzi con ML
- Integrazione con portali di vendita (pubblica annuncio diretto)
- Marketplace interno
- Servizi premium (perizie, finanziamenti, assicurazioni)

---

## Stack Tecnologico

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes (serverless)
- **Hosting**: Vercel (edge network globale)
- **Dati**: Web scraping AutoScout24 con caching 24h
- **Dominio**: vibecar.it

---

## Modello di Business Potenziale

### Attuale: Gratuito
L'app e completamente gratuita, senza monetizzazione.

### Possibili Revenue Streams

1. **Lead Generation**
   - Form contatto per vendere l'auto
   - Partnership con concessionari/rivenditori
   - Commissione su lead qualificati

2. **Affiliazioni**
   - Link affiliato ad AutoScout24 per pubblicare annunci
   - Partnership con servizi correlati (assicurazioni, finanziamenti)

3. **Freemium**
   - Base gratuita
   - Premium: storico prezzi, notifiche, report PDF, valutazioni illimitate

4. **B2B/API**
   - Accesso API per concessionari, assicurazioni, flotte
   - Dashboard white-label per rivenditori

5. **Pubblicita**
   - Banner non invasivi
   - Sponsored listings

---

## Metriche da Tracciare

- Valutazioni giornaliere/mensili
- Marche/modelli piu cercati
- Tasso di conversione form contatto
- Tempo medio sulla pagina
- Bounce rate
- Ricerche senza risultati (per migliorare copertura)

---

## Competitor

| Servizio | Pro | Contro |
|----------|-----|--------|
| AutoScout24 Quotazione | Brand forte | Richiede registrazione, meno trasparente |
| Quattroruote | Storico, autorevole | A pagamento, dati "editoriali" non real-time |
| Eurotax | Standard di settore | B2B, costoso, non per privati |
| Subito.it | Grande traffico | Non offre valutazione, solo annunci |

**VibeCar si posiziona come**: gratuito, istantaneo, trasparente, basato su dati reali.

---

## Conclusione

VibeCar e un tool semplice ma potente che risolve un problema reale: sapere quanto vale la propria auto. La semplicita d'uso, la gratuita e la trasparenza dei dati lo rendono attraente per un pubblico ampio. Il potenziale di monetizzazione e significativo, soprattutto attraverso lead generation e partnership B2B.

---

*Documento generato il 4 gennaio 2026*
*Versione: 1.0*
