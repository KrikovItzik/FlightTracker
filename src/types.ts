export interface FlightData {
  _id: number;
  CHFLTN: string; // Flight Number
  CHOPER: string; // Operator Code
  CHOPERD: string; // Airline
  CHLOCCT: string; // Country
  CHLOC1T: string; // City
  CHRMINE: string; // Status
  CHLOC1: string; // Terminal Code
  CHLOC1D: string; // Terminal Name
  CHAORD: string; // Type (Arrival/Departure)
  CHSTOL: string; // Scheduled Time
  CHPTOL: string; // Real Time
}

export interface ApiResponse {
  success: boolean;
  result: {
    records: FlightData[];
    total: number;
  };
}

// Map of country names to their ISO codes
export const countryToCode: { [key: string]: string } = {
  'ISRAEL': 'il',
  'FRANCE': 'fr',
  'UNITED STATES': 'us',
  'GERMANY': 'de',
  'UNITED KINGDOM': 'gb',
  'ITALY': 'it',
  'SPAIN': 'es',
  'NETHERLANDS': 'nl',
  'GREECE': 'gr',
  'TURKEY': 'tr',
  'RUSSIA': 'ru',
  'UKRAINE': 'ua',
  'POLAND': 'pl',
  'ROMANIA': 'ro',
  'BULGARIA': 'bg',
  'CYPRUS': 'cy',
  'SWITZERLAND': 'ch',
  'AUSTRIA': 'at',
  'BELGIUM': 'be',
  'CZECH REPUBLIC': 'cz',
  'HUNGARY': 'hu',
  'SWEDEN': 'se',
  'NORWAY': 'no',
  'DENMARK': 'dk',
  'FINLAND': 'fi',
  'PORTUGAL': 'pt',
  'IRELAND': 'ie',
  'CANADA': 'ca',
  'MEXICO': 'mx',
  'BRAZIL': 'br',
  'ARGENTINA': 'ar',
  'CHINA': 'cn',
  'JAPAN': 'jp',
  'SOUTH KOREA': 'kr',
  'INDIA': 'in',
  'AUSTRALIA': 'au',
  'NEW ZEALAND': 'nz',
  'EGYPT': 'eg',
  'MOROCCO': 'ma',
  'SOUTH AFRICA': 'za',
  'UNITED ARAB EMIRATES': 'ae',
  'QATAR': 'qa',
  'SAUDI ARABIA': 'sa',
  'THAILAND': 'th',
  'VIETNAM': 'vn',
  'SINGAPORE': 'sg',
  'MALAYSIA': 'my',
  'INDONESIA': 'id',
  'GEORGIA': 'ge',
  'AZERBAIJAN': 'az',
  'ETHIOPIA': 'et',
  'MOLDOVA': 'md',
  'RUSSIAN FEDERATION': 'ru'
};
