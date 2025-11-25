export enum FuelType {
  Gasoline = 'Benzin',
  Diesel = 'Dizel',
  LPG = 'Benzin & LPG',
  Electric = 'Elektrik',
  Hybrid = 'Hibrit'
}

export enum TransmissionType {
  Manual = 'Manuel',
  Automatic = 'Otomatik',
  SemiAutomatic = 'Yarı Otomatik'
}

export enum DamageStatus {
  Clean = 'Hatasız / Boyasız',
  LocalPaint = 'Lokal Boya (Ufak)',
  OnePartPaint = '1 Parça Boya',
  MultiPaint = '2-3 Parça Boya',
  CompletePaint = 'Komple Boyalı',
  OnePartChange = '1 Parça Değişen',
  MultiPartChange = '2-3 Parça Değişen',
  MultiPartChangePlus = '3+ Parça Değişen',
  ChassisPodium = 'Şasi / Podye / Direk İşlemli',
  Airbag = 'Airbag Açmış / Onarımlı',
  MajorDamage = 'Ağır Hasar Kayıtlı',
  Pert = 'Pert Kayıtlı'
}

export interface VehicleData {
  brand: string;
  model: string;
  year: number;
  package: string;
  fuel: FuelType;
  transmission: TransmissionType;
  km: number;
  price: number;
  city: string;
  damage: DamageStatus;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ComparableListing {
  title: string;
  price: number;
  url?: string;
  advantagePercentage: number;
  description?: string;
}

export interface AnalysisResult {
  estimatedMarketPrice: {
    min: number;
    max: number;
    average: number;
  };
  cleanMarketPrice: number; // New: Price if the car was clean
  verdict: 'Excellent' | 'Good' | 'Fair' | 'High' | 'Overpriced';
  verdictText: string;
  priceDifferencePercentage: number;
  reasoning: string[];
  damageImpact: string;
  depreciationRate: number; // Estimated % lost due to damage
  questionsToAsk: string[];
  groundingSources: GroundingSource[];
  comparableListings?: ComparableListing[];
}