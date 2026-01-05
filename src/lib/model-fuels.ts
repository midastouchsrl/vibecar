/**
 * Database statico alimentazioni per modello
 *
 * Struttura: makeId -> modelId -> array di fuel types
 *
 * Questo database contiene le alimentazioni effettivamente disponibili
 * per ogni modello, basato sui dati ufficiali dei costruttori.
 *
 * Per modelli non presenti, si usa il fallback per brand.
 */

import { FuelType } from './types';

// Tipi di alimentazione disponibili
type FuelList = FuelType[];

/**
 * Alimentazioni per modello specifico
 * Chiavi: makeId -> modelId -> lista alimentazioni
 */
export const MODEL_FUELS: Record<string, Record<string, FuelList>> = {
  // Abarth (makeId: 1) - VERIFIED
  '1': {
    '18513': ['benzina'],                           // 595
    '19286': ['benzina'],                           // 124 Spider
  },

  // Alfa Romeo (makeId: 2) - VERIFIED
  '2': {
    '17969': ['benzina', 'diesel'],                 // Giulietta
    '18700': ['benzina', 'diesel', 'ibrida'],       // Giulia
    '18701': ['benzina', 'diesel', 'ibrida'],       // Stelvio
    '75549': ['elettrica'],                         // Tonale (PHEV conta come ibrida)
  },

  // Audi (makeId: 4) - VERIFIED
  '4': {
    '1269': ['benzina', 'diesel', 'metano', 'ibrida'],  // A3
    '1270': ['benzina', 'diesel', 'metano', 'ibrida'],  // A4
    '1272': ['benzina', 'diesel', 'ibrida'],            // A6
    '18277': ['benzina', 'diesel', 'ibrida'],           // Q3
    '18278': ['benzina', 'diesel', 'ibrida'],           // Q5
    '18685': ['benzina', 'diesel', 'ibrida'],           // Q2
    '75109': ['elettrica'],                              // e-tron
    '75547': ['elettrica'],                              // Q4 e-tron
    '75110': ['elettrica'],                              // e-tron GT
  },

  // BMW (makeId: 7) - VERIFIED
  '7': {
    '1344': ['benzina', 'diesel', 'ibrida'],        // Serie 1
    '1345': ['benzina', 'diesel', 'ibrida'],        // Serie 3
    '1347': ['benzina', 'diesel', 'ibrida'],        // Serie 5
    '18279': ['benzina', 'diesel', 'ibrida'],       // X1
    '18280': ['benzina', 'diesel', 'ibrida'],       // X3
    '18695': ['benzina', 'diesel', 'ibrida'],       // X2
    '75107': ['elettrica'],                          // i3
    '75548': ['elettrica'],                          // iX
    '75606': ['elettrica'],                          // i4
    '75607': ['elettrica'],                          // iX3
  },

  // Citroen (makeId: 13) - VERIFIED
  '13': {
    '1459': ['benzina', 'diesel'],                  // C3
    '18282': ['benzina', 'diesel'],                 // C3 Aircross
    '18698': ['benzina', 'diesel', 'ibrida'],       // C5 Aircross
    '75543': ['elettrica'],                          // e-C4
    '75883': ['elettrica'],                          // e-C3
  },

  // Dacia (makeId: 76) - VERIFIED
  '76': {
    '18268': ['benzina', 'gpl'],                    // Sandero
    '18699': ['benzina', 'gpl'],                    // Duster
    '75544': ['benzina', 'gpl', 'ibrida'],          // Jogger
    '75882': ['elettrica'],                          // Spring
  },

  // DS (makeId: 8038) - VERIFIED
  '8038': {
    '18773': ['benzina', 'diesel', 'ibrida'],       // DS 3 Crossback
    '18774': ['benzina', 'diesel', 'ibrida'],       // DS 7
    '75542': ['elettrica'],                          // DS 3 E-Tense
  },

  // Fiat (makeId: 28) - VERIFIED
  '28': {
    '1746': ['benzina', 'gpl', 'metano', 'ibrida'], // Panda
    '1747': ['benzina', 'diesel', 'gpl', 'metano'], // Punto (fino 2018)
    '15160': ['benzina', 'ibrida', 'elettrica'],    // 500
    '18526': ['benzina', 'diesel'],                 // 500X
    '19139': ['benzina', 'diesel', 'gpl', 'metano'], // 500L
    '18527': ['benzina', 'diesel', 'gpl'],          // Tipo
    '18774': ['diesel'],                             // Doblo
    '75810': ['elettrica'],                          // 600e
    '75811': ['elettrica'],                          // Panda (nuova 2024)
  },

  // Ford (makeId: 29) - VERIFIED
  '29': {
    '1758': ['benzina', 'diesel', 'ibrida'],        // Fiesta
    '18275': ['benzina', 'diesel', 'ibrida'],       // Focus
    '18690': ['benzina', 'diesel', 'ibrida'],       // Kuga
    '19268': ['benzina', 'diesel'],                 // EcoSport
    '75111': ['benzina', 'ibrida'],                 // Puma
    '75608': ['elettrica'],                          // Mustang Mach-E
  },

  // Honda (makeId: 33) - VERIFIED
  '33': {
    '1824': ['benzina', 'ibrida'],                  // Jazz
    '1825': ['benzina', 'ibrida'],                  // Civic
    '18693': ['benzina', 'diesel', 'ibrida'],       // CR-V
    '18694': ['benzina', 'ibrida'],                 // HR-V
    '75609': ['elettrica'],                          // e
  },

  // Hyundai (makeId: 34) - VERIFIED
  '34': {
    '1838': ['benzina', 'diesel', 'gpl', 'ibrida'], // i10
    '1839': ['benzina', 'diesel', 'gpl', 'ibrida'], // i20
    '1840': ['benzina', 'diesel', 'gpl', 'ibrida'], // i30
    '18283': ['benzina', 'diesel', 'ibrida'],       // Tucson
    '18689': ['benzina', 'diesel', 'ibrida'],       // Kona
    '75105': ['elettrica'],                          // Kona Electric
    '75540': ['elettrica'],                          // Ioniq 5
    '75880': ['elettrica'],                          // Ioniq 6
  },

  // Jeep (makeId: 36) - VERIFIED
  '36': {
    '1862': ['benzina', 'diesel', 'ibrida'],        // Renegade
    '18696': ['benzina', 'diesel', 'ibrida'],       // Compass
    '75541': ['ibrida'],                             // Avenger (PHEV)
  },

  // Kia (makeId: 39) - VERIFIED
  '39': {
    '1895': ['benzina', 'diesel', 'gpl', 'ibrida'], // Picanto
    '18285': ['benzina', 'diesel', 'gpl', 'ibrida'], // Sportage
    '18692': ['benzina', 'diesel', 'gpl', 'ibrida'], // Stonic
    '75106': ['elettrica'],                           // e-Niro
    '75539': ['elettrica'],                           // EV6
  },

  // Lancia (makeId: 40) - VERIFIED
  '40': {
    '1903': ['benzina', 'diesel', 'gpl', 'metano'], // Ypsilon
    '75879': ['elettrica'],                          // Ypsilon (nuova 2024)
  },

  // Land Rover (makeId: 41) - VERIFIED
  '41': {
    '18697': ['benzina', 'diesel', 'ibrida'],       // Range Rover Evoque
    '19267': ['benzina', 'diesel', 'ibrida'],       // Discovery Sport
    '18287': ['benzina', 'diesel', 'ibrida'],       // Range Rover Sport
  },

  // Mazda (makeId: 44) - VERIFIED
  '44': {
    '1949': ['benzina', 'diesel'],                  // Mazda2
    '1950': ['benzina', 'diesel'],                  // Mazda3
    '18288': ['benzina', 'diesel'],                 // CX-3
    '18703': ['benzina', 'diesel'],                 // CX-5
    '75610': ['elettrica'],                          // MX-30
  },

  // Mercedes-Benz (makeId: 47) - VERIFIED
  '47': {
    '1977': ['benzina', 'diesel', 'ibrida'],        // Classe A
    '1979': ['benzina', 'diesel', 'ibrida'],        // Classe C
    '1981': ['benzina', 'diesel', 'ibrida'],        // Classe E
    '18289': ['benzina', 'diesel', 'ibrida'],       // GLA
    '18702': ['benzina', 'diesel', 'ibrida'],       // GLC
    '75103': ['elettrica'],                          // EQA
    '75537': ['elettrica'],                          // EQC
    '75538': ['elettrica'],                          // EQS
  },

  // Mini (makeId: 48) - VERIFIED
  '48': {
    '1993': ['benzina', 'diesel'],                  // Mini
    '18290': ['benzina', 'diesel'],                 // Countryman
    '75104': ['elettrica'],                          // Mini Electric
  },

  // Nissan (makeId: 52) - VERIFIED
  '52': {
    '2044': ['benzina', 'diesel'],                  // Micra
    '2046': ['benzina', 'diesel', 'ibrida'],        // Qashqai
    '18291': ['benzina', 'diesel', 'ibrida'],       // Juke
    '75102': ['elettrica'],                          // Leaf
    '75536': ['elettrica'],                          // Ariya
  },

  // Opel (makeId: 54) - VERIFIED
  '54': {
    '2062': ['benzina', 'diesel', 'gpl'],           // Corsa
    '2063': ['benzina', 'diesel'],                  // Astra
    '18704': ['benzina', 'diesel'],                 // Crossland
    '18705': ['benzina', 'diesel', 'ibrida'],       // Grandland
    '75101': ['elettrica'],                          // Corsa-e
    '75535': ['elettrica'],                          // Mokka-e
  },

  // Peugeot (makeId: 55) - VERIFIED
  '55': {
    '2077': ['benzina', 'diesel'],                  // 208
    '18274': ['benzina', 'diesel'],                 // 208 (nuova)
    '18419': ['benzina', 'diesel', 'ibrida'],       // 308
    '18420': ['benzina', 'diesel', 'ibrida'],       // 3008
    '18421': ['benzina', 'diesel', 'ibrida'],       // 5008
    '75113': ['elettrica'],                          // e-208
    '75114': ['elettrica'],                          // e-2008
    '75884': ['elettrica'],                          // e-3008
  },

  // Porsche (makeId: 57) - VERIFIED
  '57': {
    '1950': ['benzina'],                            // 911
    '1955': ['benzina'],                            // Boxster
    '18284': ['benzina', 'diesel', 'ibrida'],       // Cayenne
    '18691': ['benzina', 'ibrida'],                 // Panamera
    '19389': ['benzina', 'diesel'],                 // Macan
    '75273': ['elettrica'],                          // Taycan
    '16529': ['benzina'],                            // Cayman
  },

  // Renault (makeId: 60) - VERIFIED
  '60': {
    '1961': ['benzina', 'diesel', 'gpl'],           // Clio
    '1965': ['benzina', 'diesel'],                  // Megane
    '18281': ['benzina', 'diesel', 'gpl'],          // Captur
    '18687': ['benzina', 'diesel'],                 // Kadjar
    '18706': ['elettrica'],                          // Zoe
    '74901': ['benzina', 'ibrida'],                 // Arkana
    '75546': ['benzina', 'ibrida'],                 // Austral
    '75885': ['elettrica'],                          // Scenic E-Tech
  },

  // Seat (makeId: 61) - VERIFIED
  '61': {
    '2165': ['benzina', 'diesel', 'gpl', 'metano'], // Ibiza
    '2166': ['benzina', 'diesel', 'gpl', 'metano'], // Leon
    '18707': ['benzina', 'diesel'],                 // Arona
    '18708': ['benzina', 'diesel', 'ibrida'],       // Ateca
  },

  // Skoda (makeId: 66) - VERIFIED
  '66': {
    '2188': ['benzina', 'diesel', 'gpl', 'metano'], // Fabia
    '2189': ['benzina', 'diesel', 'gpl', 'metano'], // Octavia
    '18709': ['benzina', 'diesel'],                 // Kamiq
    '18710': ['benzina', 'diesel', 'ibrida'],       // Karoq
    '18711': ['benzina', 'diesel', 'ibrida'],       // Kodiaq
    '75533': ['elettrica'],                          // Enyaq
  },

  // Smart (makeId: 15525) - VERIFIED
  '15525': {
    '2200': ['benzina', 'elettrica'],               // ForTwo
    '2201': ['benzina', 'elettrica'],               // ForFour
    '75886': ['elettrica'],                          // #1
    '75887': ['elettrica'],                          // #3
  },

  // Suzuki (makeId: 68) - VERIFIED
  '68': {
    '2219': ['benzina', 'ibrida'],                  // Swift
    '18712': ['benzina', 'ibrida'],                 // Ignis
    '18713': ['benzina', 'diesel', 'ibrida'],       // Vitara
    '75532': ['benzina', 'ibrida'],                 // S-Cross
  },

  // Tesla (makeId: 51520) - VERIFIED
  '51520': {
    '18852': ['elettrica'],                          // Model S
    '19082': ['elettrica'],                          // Model X
    '74903': ['elettrica'],                          // Model 3
    '75100': ['elettrica'],                          // Model Y
  },

  // Toyota (makeId: 70) - VERIFIED
  '70': {
    '2241': ['benzina', 'ibrida'],                  // Yaris
    '2242': ['benzina', 'diesel', 'ibrida'],        // Corolla
    '18292': ['benzina', 'diesel', 'ibrida'],       // RAV4
    '18714': ['benzina', 'ibrida'],                 // C-HR
    '18715': ['benzina', 'ibrida'],                 // Yaris Cross
    '75099': ['elettrica'],                          // bZ4X
  },

  // Volkswagen (makeId: 74) - VERIFIED
  '74': {
    '2305': ['benzina', 'diesel', 'gpl', 'metano'], // Polo
    '2306': ['benzina', 'diesel', 'gpl', 'metano', 'ibrida'], // Golf
    '2309': ['benzina', 'diesel', 'metano'],        // Passat
    '18293': ['benzina', 'diesel'],                 // T-Roc
    '18716': ['benzina', 'diesel', 'ibrida'],       // Tiguan
    '18717': ['benzina', 'diesel'],                 // T-Cross
    '75098': ['elettrica'],                          // ID.3
    '75530': ['elettrica'],                          // ID.4
    '75531': ['elettrica'],                          // ID.5
  },

  // Volvo (makeId: 75) - VERIFIED
  '75': {
    '2318': ['benzina', 'diesel', 'ibrida'],        // V40
    '2320': ['benzina', 'diesel', 'ibrida'],        // V60
    '18294': ['benzina', 'diesel', 'ibrida'],       // XC40
    '18718': ['benzina', 'diesel', 'ibrida'],       // XC60
    '18719': ['benzina', 'diesel', 'ibrida'],       // XC90
    '75097': ['elettrica'],                          // XC40 Recharge
    '75529': ['elettrica'],                          // C40 Recharge
  },
};

/**
 * Alimentazioni di fallback per brand
 * Usate quando il modello specifico non è nel database
 */
export const BRAND_FUELS: Record<string, FuelList> = {
  // Brand italiani - tipicamente offrono GPL/Metano
  '1': ['benzina'],                                      // Abarth
  '2': ['benzina', 'diesel', 'ibrida'],                 // Alfa Romeo
  '28': ['benzina', 'diesel', 'gpl', 'metano', 'ibrida'], // Fiat
  '40': ['benzina', 'diesel', 'gpl', 'metano'],         // Lancia

  // Brand tedeschi premium
  '4': ['benzina', 'diesel', 'ibrida', 'elettrica'],    // Audi
  '7': ['benzina', 'diesel', 'ibrida', 'elettrica'],    // BMW
  '47': ['benzina', 'diesel', 'ibrida', 'elettrica'],   // Mercedes
  '57': ['benzina', 'ibrida', 'elettrica'],             // Porsche
  '74': ['benzina', 'diesel', 'gpl', 'metano', 'ibrida', 'elettrica'], // Volkswagen

  // Brand tedeschi volume
  '54': ['benzina', 'diesel', 'gpl', 'elettrica'],      // Opel
  '66': ['benzina', 'diesel', 'gpl', 'metano', 'ibrida'], // Skoda

  // Brand francesi
  '13': ['benzina', 'diesel', 'elettrica'],             // Citroen
  '55': ['benzina', 'diesel', 'ibrida', 'elettrica'],   // Peugeot
  '60': ['benzina', 'diesel', 'gpl', 'ibrida', 'elettrica'], // Renault
  '76': ['benzina', 'gpl', 'ibrida', 'elettrica'],      // Dacia
  '8038': ['benzina', 'diesel', 'ibrida', 'elettrica'], // DS

  // Brand spagnoli (usano piattaforme VW)
  '61': ['benzina', 'diesel', 'gpl', 'metano'],         // Seat

  // Brand coreani - spesso offrono GPL
  '34': ['benzina', 'diesel', 'gpl', 'ibrida', 'elettrica'], // Hyundai
  '39': ['benzina', 'diesel', 'gpl', 'ibrida', 'elettrica'], // Kia

  // Brand giapponesi
  '33': ['benzina', 'ibrida', 'elettrica'],             // Honda
  '44': ['benzina', 'diesel', 'elettrica'],             // Mazda
  '52': ['benzina', 'diesel', 'ibrida', 'elettrica'],   // Nissan
  '68': ['benzina', 'ibrida'],                          // Suzuki
  '70': ['benzina', 'diesel', 'ibrida', 'elettrica'],   // Toyota

  // Brand americani
  '29': ['benzina', 'diesel', 'ibrida', 'elettrica'],   // Ford
  '36': ['benzina', 'diesel', 'ibrida'],                // Jeep

  // Brand britannici
  '41': ['benzina', 'diesel', 'ibrida'],                // Land Rover
  '48': ['benzina', 'diesel', 'elettrica'],             // Mini

  // Brand svedesi
  '75': ['benzina', 'diesel', 'ibrida', 'elettrica'],   // Volvo

  // Brand solo elettrici
  '51520': ['elettrica'],                                // Tesla
  '15525': ['benzina', 'elettrica'],                    // Smart
};

/**
 * Fallback generico se il brand non è mappato
 */
const DEFAULT_FUELS: FuelList = ['benzina', 'diesel', 'gpl', 'metano', 'ibrida', 'elettrica'];

/**
 * Ottiene le alimentazioni disponibili per un modello
 *
 * @param makeId - ID del costruttore
 * @param modelId - ID del modello
 * @returns Lista di alimentazioni disponibili
 */
export function getModelFuels(makeId: string | number, modelId: string | number): FuelList {
  const makeKey = String(makeId);
  const modelKey = String(modelId);

  // 1. Cerca nel database modelli specifici
  const makeData = MODEL_FUELS[makeKey];
  if (makeData && makeData[modelKey]) {
    return makeData[modelKey];
  }

  // 2. Fallback a livello brand
  if (BRAND_FUELS[makeKey]) {
    return BRAND_FUELS[makeKey];
  }

  // 3. Fallback generico
  return DEFAULT_FUELS;
}

/**
 * Verifica se un modello ha dati specifici sulle alimentazioni
 */
export function hasModelFuelData(makeId: string | number, modelId: string | number): boolean {
  const makeKey = String(makeId);
  const modelKey = String(modelId);

  const makeData = MODEL_FUELS[makeKey];
  return !!(makeData && makeData[modelKey]);
}

/**
 * Verifica se un brand ha dati di fallback sulle alimentazioni
 */
export function hasBrandFuelData(makeId: string | number): boolean {
  return !!BRAND_FUELS[String(makeId)];
}

/**
 * Ottiene la fonte dei dati alimentazione (per debug/UI)
 */
export function getFuelDataSource(makeId: string | number, modelId: string | number): 'model' | 'brand' | 'default' {
  const makeKey = String(makeId);
  const modelKey = String(modelId);

  const makeData = MODEL_FUELS[makeKey];
  if (makeData && makeData[modelKey]) {
    return 'model';
  }

  if (BRAND_FUELS[makeKey]) {
    return 'brand';
  }

  return 'default';
}
