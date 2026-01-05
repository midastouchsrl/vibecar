/**
 * Model Production Years Database
 * Static data for popular car models in Italian market
 *
 * Format: { [makeId]: { [modelId]: { start: number, end?: number } } }
 * - end is optional, if omitted means still in production
 */

// Current year for calculations
const CURRENT_YEAR = new Date().getFullYear();

// Minimum reasonable year for used cars
const MIN_YEAR = 1990;

// Model production years data
// Source: Wikipedia, manufacturer data
const MODEL_YEARS: Record<string, Record<string, { start: number; end?: number }>> = {
  // Fiat (makeId: 24)
  '24': {
    '14473': { start: 2003 },           // Panda (current gen 2003+)
    '14430': { start: 2007 },           // 500 (modern)
    '14439': { start: 2015, end: 2023 }, // 500X
    '14431': { start: 2007, end: 2019 }, // 500L
    '14464': { start: 2015, end: 2022 }, // Tipo
    '14454': { start: 1983 },           // Punto (various gens)
    '14428': { start: 2023 },           // 600e
    '14444': { start: 2014, end: 2023 }, // Doblo
  },

  // Volkswagen (makeId: 74)
  '74': {
    '19026': { start: 1974 },           // Golf
    '19062': { start: 2008 },           // Polo (current platform)
    '19074': { start: 2008 },           // Tiguan
    '19057': { start: 2003 },           // Passat
    '19073': { start: 2016 },           // T-Roc
    '19080': { start: 2018 },           // T-Cross
    '19034': { start: 2020 },           // ID.3
    '19033': { start: 2021 },           // ID.4
    '19077': { start: 2017 },           // Arteon
  },

  // BMW (makeId: 9)
  '9': {
    '13233': { start: 1975 },           // Serie 3
    '13232': { start: 1972 },           // Serie 5
    '13217': { start: 1994 },           // Serie 1
    '13259': { start: 2009 },           // X1
    '13262': { start: 2010 },           // X3
    '13265': { start: 2007 },           // X5
    '13268': { start: 2008 },           // X6
    '13219': { start: 2013 },           // Serie 2
    '13223': { start: 2005 },           // Serie 4
    '13296': { start: 2021 },           // iX
    '13247': { start: 2013 },           // i3
  },

  // Mercedes-Benz (makeId: 47)
  '47': {
    '17434': { start: 1982 },           // Classe A
    '17438': { start: 1993 },           // Classe C
    '17442': { start: 1984 },           // Classe E
    '17446': { start: 1972 },           // Classe S
    '17454': { start: 2013 },           // CLA
    '17457': { start: 1997 },           // CLK
    '17461': { start: 2008 },           // GLA
    '17463': { start: 2015 },           // GLC
    '17465': { start: 2006 },           // GLE
    '17467': { start: 1979 },           // GLS
    '17550': { start: 2019 },           // EQC
    '17551': { start: 2021 },           // EQA
    '17552': { start: 2021 },           // EQB
    '17553': { start: 2022 },           // EQE
    '17554': { start: 2021 },           // EQS
  },

  // Audi (makeId: 5)
  '5': {
    '13108': { start: 1996 },           // A3
    '13112': { start: 1994 },           // A4
    '13117': { start: 1994 },           // A6
    '13136': { start: 2016 },           // Q2
    '13138': { start: 2011 },           // Q3
    '13140': { start: 2008 },           // Q5
    '13145': { start: 2006 },           // Q7
    '13147': { start: 2018 },           // Q8
    '13127': { start: 2018 },           // e-tron
    '13129': { start: 2021 },           // e-tron GT
  },

  // Toyota (makeId: 71)
  '71': {
    '18892': { start: 1966 },           // Corolla
    '18929': { start: 1997 },           // Yaris
    '18886': { start: 1994 },           // RAV4
    '18876': { start: 2016 },           // C-HR
    '18867': { start: 1997 },           // Prius
    '18850': { start: 2007 },           // Aygo (ended 2023)
    '18851': { start: 2023 },           // Aygo X
    '18898': { start: 2020 },           // Yaris Cross
  },

  // Ford (makeId: 25)
  '25': {
    '14547': { start: 1998 },           // Fiesta (ended 2023)
    '14552': { start: 1998 },           // Focus
    '14567': { start: 2008 },           // Kuga
    '14578': { start: 2012 },           // EcoSport
    '14579': { start: 2017 },           // Puma
    '14569': { start: 2021 },           // Mustang Mach-E
  },

  // Renault (makeId: 60)
  '60': {
    '18108': { start: 1990 },           // Clio
    '18086': { start: 2008 },           // Captur
    '18132': { start: 2002 },           // Megane
    '18155': { start: 2015 },           // Kadjar
    '18087': { start: 2022 },           // Austral
    '18182': { start: 2012 },           // Zoe
    '18098': { start: 2020 },           // Arkana
  },

  // Peugeot (makeId: 54)
  '54': {
    '17747': { start: 2012 },           // 208
    '17769': { start: 2013 },           // 308
    '17714': { start: 2016 },           // 3008
    '17716': { start: 2017 },           // 5008
    '17720': { start: 2019 },           // e-208
    '17734': { start: 2020 },           // e-2008
  },

  // Citroen (makeId: 13)
  '13': {
    '13475': { start: 2009 },           // C3
    '13479': { start: 2018 },           // C3 Aircross
    '13493': { start: 2014 },           // C4 Cactus
    '13481': { start: 2020 },           // C4
    '13482': { start: 2017 },           // C5 Aircross
  },

  // Jeep (makeId: 36)
  '36': {
    '16182': { start: 2014 },           // Renegade
    '16177': { start: 2017 },           // Compass
    '16191': { start: 1993 },           // Grand Cherokee
    '16201': { start: 2007 },           // Wrangler
    '16168': { start: 2022 },           // Avenger
  },

  // Alfa Romeo (makeId: 2)
  '2': {
    '13004': { start: 2008, end: 2018 }, // MiTo
    '13011': { start: 2010 },           // Giulietta
    '13005': { start: 2016 },           // Giulia
    '13023': { start: 2017 },           // Stelvio
    '13029': { start: 2023 },           // Tonale
  },

  // Porsche (makeId: 56)
  '56': {
    '17879': { start: 1996 },           // Boxster
    '17885': { start: 1963 },           // 911
    '17875': { start: 2002 },           // Cayenne
    '17889': { start: 2009 },           // Panamera
    '17883': { start: 2014 },           // Macan
    '17900': { start: 2019 },           // Taycan (IMPORTANTE: dal 2019!)
  },

  // Tesla (makeId: 69)
  '69': {
    '18789': { start: 2012 },           // Model S
    '18787': { start: 2015 },           // Model X
    '18786': { start: 2017 },           // Model 3
    '18790': { start: 2020 },           // Model Y
  },

  // Smart (makeId: 63)
  '63': {
    '18334': { start: 1998 },           // ForTwo
    '18333': { start: 2014 },           // ForFour
    '18335': { start: 2023 },           // #1
  },

  // Opel (makeId: 52)
  '52': {
    '17622': { start: 2000 },           // Corsa
    '17589': { start: 2004 },           // Astra
    '17642': { start: 2017 },           // Crossland
    '17640': { start: 2017 },           // Grandland
    '17646': { start: 2019 },           // Mokka
  },

  // Hyundai (makeId: 33)
  '33': {
    '15943': { start: 2011 },           // i10
    '15945': { start: 2008 },           // i20
    '15948': { start: 2011 },           // i30
    '15973': { start: 2015 },           // Tucson
    '15963': { start: 2013 },           // Santa Fe
    '15959': { start: 2017 },           // Kona
    '15953': { start: 2016 },           // Ioniq
    '15954': { start: 2021 },           // Ioniq 5
    '15955': { start: 2022 },           // Ioniq 6
  },

  // Kia (makeId: 38)
  '38': {
    '16272': { start: 2017 },           // Picanto
    '16262': { start: 2015 },           // Stonic
    '16246': { start: 2016 },           // Niro
    '16260': { start: 2016 },           // Sportage
    '16232': { start: 2021 },           // EV6
  },

  // Nissan (makeId: 51)
  '51': {
    '17535': { start: 2010 },           // Micra
    '17551': { start: 2014 },           // Qashqai
    '17515': { start: 2014 },           // Juke
    '17526': { start: 2010 },           // Leaf
    '17503': { start: 2022 },           // Ariya
  },

  // Skoda (makeId: 62)
  '62': {
    '18269': { start: 1996 },           // Octavia
    '18266': { start: 1999 },           // Fabia
    '18291': { start: 2009 },           // Superb
    '18273': { start: 2009 },           // Yeti (ended 2017)
    '18280': { start: 2016 },           // Kodiaq
    '18274': { start: 2017 },           // Karoq
    '18276': { start: 2019 },           // Kamiq
    '18258': { start: 2020 },           // Enyaq
  },

  // Dacia (makeId: 16)
  '16': {
    '13616': { start: 2004 },           // Logan
    '13621': { start: 2010 },           // Duster
    '13625': { start: 2012 },           // Sandero
    '13626': { start: 2021 },           // Spring
    '13610': { start: 2022 },           // Jogger
  },

  // Lancia (makeId: 40)
  '40': {
    '16356': { start: 2011 },           // Ypsilon
  },

  // Seat (makeId: 61)
  '61': {
    '18218': { start: 2002 },           // Ibiza
    '18225': { start: 2012 },           // Leon
    '18195': { start: 2016 },           // Ateca
    '18194': { start: 2018 },           // Arona
    '18230': { start: 2018 },           // Tarraco
  },

  // Cupra (makeId: 158) - Spin-off from Seat
  '158': {
    '21082': { start: 2018 },           // Ateca
    '21083': { start: 2020 },           // Formentor
    '21084': { start: 2021 },           // Born
    '21085': { start: 2020 },           // Leon
  },

  // Volvo (makeId: 75)
  '75': {
    '19148': { start: 2017 },           // XC40
    '19151': { start: 2014 },           // XC60
    '19153': { start: 2015 },           // XC90
    '19103': { start: 2018 },           // V60
    '19110': { start: 2016 },           // V90
    '19096': { start: 2018 },           // S60
    '19097': { start: 2016 },           // S90
    '19161': { start: 2020 },           // XC40 Recharge
    '19162': { start: 2022 },           // C40 Recharge
  },

  // Land Rover (makeId: 39)
  '39': {
    '16323': { start: 2011 },           // Evoque
    '16318': { start: 2017 },           // Velar
    '16330': { start: 2012 },           // Range Rover Sport
    '16331': { start: 2012 },           // Range Rover
    '16311': { start: 2015 },           // Discovery Sport
    '16308': { start: 2016 },           // Discovery
    '16304': { start: 2020 },           // Defender
  },

  // Mini (makeId: 48)
  '48': {
    '17488': { start: 2001 },           // Mini (hatchback)
    '17485': { start: 2007 },           // Clubman
    '17479': { start: 2010 },           // Countryman
    '17481': { start: 2016 },           // Convertible
  },

  // Mazda (makeId: 46)
  '46': {
    '17409': { start: 2003 },           // Mazda2
    '17403': { start: 2003 },           // Mazda3
    '17413': { start: 2012 },           // CX-5
    '17393': { start: 2015 },           // CX-3
    '17395': { start: 2019 },           // CX-30
    '17423': { start: 2015 },           // MX-5
  },

  // Suzuki (makeId: 67)
  '67': {
    '18634': { start: 2004 },           // Swift
    '18642': { start: 2015 },           // Vitara
    '18625': { start: 2020 },           // Across
    '18628': { start: 2016 },           // Ignis
    '18632': { start: 2020 },           // Swace
  },

  // Honda (makeId: 32)
  '32': {
    '15869': { start: 1972 },           // Civic
    '15882': { start: 2015 },           // HR-V
    '15877': { start: 2006 },           // CR-V
    '15871': { start: 2019 },           // e
    '15883': { start: 2001 },           // Jazz
  },

  // Mitsubishi (makeId: 49)
  '49': {
    '17512': { start: 2010 },           // ASX
    '17527': { start: 2012 },           // Outlander
    '17533': { start: 2013 },           // Space Star
  },

  // DS (makeId: 152) - Premium Citroen spin-off
  '152': {
    '20851': { start: 2018 },           // DS 3 Crossback
    '20856': { start: 2021 },           // DS 4
    '20859': { start: 2017 },           // DS 7
    '20853': { start: 2022 },           // DS 9
  },
};

/**
 * Get valid production years for a specific model
 * Returns array of years from production start to current year (or end year)
 */
export function getModelYears(makeId: string, modelId: string): number[] {
  const makeData = MODEL_YEARS[makeId];

  if (makeData && makeData[modelId]) {
    const { start, end } = makeData[modelId];
    const endYear = end || CURRENT_YEAR;
    const years: number[] = [];

    for (let year = endYear; year >= start; year--) {
      years.push(year);
    }

    return years;
  }

  // Fallback: return default range (last 35 years)
  return getDefaultYears();
}

/**
 * Get default year range when model data is not available
 */
export function getDefaultYears(): number[] {
  const years: number[] = [];
  for (let year = CURRENT_YEAR; year >= MIN_YEAR; year--) {
    years.push(year);
  }
  return years;
}

/**
 * Check if a year is valid for a specific model
 */
export function isYearValidForModel(makeId: string, modelId: string, year: number): boolean {
  const makeData = MODEL_YEARS[makeId];

  if (makeData && makeData[modelId]) {
    const { start, end } = makeData[modelId];
    const endYear = end || CURRENT_YEAR;
    return year >= start && year <= endYear;
  }

  // Fallback: accept any year in reasonable range
  return year >= MIN_YEAR && year <= CURRENT_YEAR;
}

/**
 * Get production year info for display
 */
export function getModelYearInfo(makeId: string, modelId: string): { start: number; end?: number; known: boolean } | null {
  const makeData = MODEL_YEARS[makeId];

  if (makeData && makeData[modelId]) {
    return {
      ...makeData[modelId],
      known: true,
    };
  }

  return {
    start: MIN_YEAR,
    known: false,
  };
}

/**
 * Check if we have production year data for a model
 */
export function hasModelYearData(makeId: string, modelId: string): boolean {
  const makeData = MODEL_YEARS[makeId];
  return !!(makeData && makeData[modelId]);
}
