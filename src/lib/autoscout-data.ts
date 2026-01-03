/**
 * AutoScout24 Data Mapping
 * IDs estratti direttamente da autoscout24.it (verificati)
 */

export interface CarMake {
  id: number;
  name: string;
  slug: string;
}

export interface CarModel {
  id: number;
  name: string;
  makeId: number;
}

// Mapping completo marche -> ID AutoScout24 (verificati)
export const CAR_MAKES: CarMake[] = [
  { id: 16396, name: 'Abarth', slug: 'abarth' },
  { id: 6, name: 'Alfa Romeo', slug: 'alfa-romeo' },
  { id: 9, name: 'Audi', slug: 'audi' },
  { id: 13, name: 'BMW', slug: 'bmw' },
  { id: 16379, name: 'BYD', slug: 'byd' },
  { id: 19, name: 'Chevrolet', slug: 'chevrolet' },
  { id: 21, name: 'Citroen', slug: 'citroen' },
  { id: 51802, name: 'CUPRA', slug: 'cupra' },
  { id: 16360, name: 'Dacia', slug: 'dacia' },
  { id: 16415, name: 'DS Automobiles', slug: 'ds-automobiles' },
  { id: 28, name: 'Fiat', slug: 'fiat' },
  { id: 29, name: 'Ford', slug: 'ford' },
  { id: 51885, name: 'Genesis', slug: 'genesis' },
  { id: 31, name: 'Honda', slug: 'honda' },
  { id: 33, name: 'Hyundai', slug: 'hyundai' },
  { id: 37, name: 'Jaguar', slug: 'jaguar' },
  { id: 38, name: 'Jeep', slug: 'jeep' },
  { id: 39, name: 'Kia', slug: 'kia' },
  { id: 42, name: 'Lancia', slug: 'lancia' },
  { id: 15641, name: 'Land Rover', slug: 'land-rover' },
  { id: 43, name: 'Lexus', slug: 'lexus' },
  { id: 46, name: 'Mazda', slug: 'mazda' },
  { id: 47, name: 'Mercedes-Benz', slug: 'mercedes-benz' },
  { id: 48, name: 'MG', slug: 'mg' },
  { id: 16338, name: 'MINI', slug: 'mini' },
  { id: 50, name: 'Mitsubishi', slug: 'mitsubishi' },
  { id: 52, name: 'Nissan', slug: 'nissan' },
  { id: 54, name: 'Opel', slug: 'opel' },
  { id: 55, name: 'Peugeot', slug: 'peugeot' },
  { id: 51817, name: 'Polestar', slug: 'polestar' },
  { id: 57, name: 'Porsche', slug: 'porsche' },
  { id: 60, name: 'Renault', slug: 'renault' },
  { id: 64, name: 'SEAT', slug: 'seat' },
  { id: 65, name: 'Skoda', slug: 'skoda' },
  { id: 15525, name: 'smart', slug: 'smart' },
  { id: 66, name: 'SsangYong', slug: 'ssangyong' },
  { id: 67, name: 'Subaru', slug: 'subaru' },
  { id: 68, name: 'Suzuki', slug: 'suzuki' },
  { id: 51520, name: 'Tesla', slug: 'tesla' },
  { id: 70, name: 'Toyota', slug: 'toyota' },
  { id: 74, name: 'Volkswagen', slug: 'volkswagen' },
  { id: 73, name: 'Volvo', slug: 'volvo' },
];

// Lookup veloce per nome marca
export const MAKE_BY_NAME: Record<string, CarMake> = {};
export const MAKE_BY_ID: Record<number, CarMake> = {};

CAR_MAKES.forEach((make) => {
  MAKE_BY_NAME[make.name.toLowerCase()] = make;
  MAKE_BY_ID[make.id] = make;
});

/**
 * Trova una marca per nome (case-insensitive)
 */
export function findMakeByName(name: string): CarMake | undefined {
  return MAKE_BY_NAME[name.toLowerCase()];
}

/**
 * Trova una marca per ID
 */
export function findMakeById(id: number): CarMake | undefined {
  return MAKE_BY_ID[id];
}

/**
 * URL API AutoScout24 per i modelli di una marca
 */
export function getModelsApiUrl(makeId: number): string {
  return `https://www.autoscout24.it/as24-home/api/taxonomy/cars/makes/${makeId}/models`;
}

/**
 * URL di ricerca AutoScout24
 */
export function buildAutoScoutSearchUrl(params: {
  makeId: number;
  modelId?: number;
  yearFrom?: number;
  yearTo?: number;
  kmFrom?: number;
  kmTo?: number;
  fuel?: string;
  gear?: string;
}): string {
  const searchParams = new URLSearchParams({
    cy: 'I',
    atype: 'C',
    'ustate': 'N,U',
    sort: 'standard',
    desc: '0',
    damaged_listing: 'exclude',
  });

  // mmm = make|model|modelline format
  let mmm = `${params.makeId}|`;
  if (params.modelId) {
    mmm += `${params.modelId}|`;
  } else {
    mmm += '|';
  }
  searchParams.set('mmm', mmm);

  if (params.yearFrom) searchParams.set('fregfrom', String(params.yearFrom));
  if (params.yearTo) searchParams.set('fregto', String(params.yearTo));
  if (params.kmFrom) searchParams.set('kmfrom', String(params.kmFrom));
  if (params.kmTo) searchParams.set('kmto', String(params.kmTo));
  if (params.fuel) searchParams.set('fuel', params.fuel);
  if (params.gear) searchParams.set('gear', params.gear);

  return `https://www.autoscout24.it/lst?${searchParams.toString()}`;
}

// Mapping alimentazione per AutoScout24
export const FUEL_MAP: Record<string, string> = {
  benzina: 'B',
  diesel: 'D',
  gpl: 'L',
  metano: 'M',
  ibrida: '2',
  'ibrida-diesel': '4',
  elettrica: 'E',
};

// Mapping cambio
export const GEARBOX_MAP: Record<string, string> = {
  manuale: 'M',
  automatico: 'A',
};
