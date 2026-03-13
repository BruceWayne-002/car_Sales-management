// India-specific car valuation engine

// Base MSRP table (approximate on-road prices in INR)
const MODEL_PRICES: Record<string, number> = {
  // Tata
  'Tata Nexon': 850000,
  'Tata Punch': 600000,
  'Tata Harrier': 1550000,
  'Tata Safari': 1650000,
  'Tata Altroz': 680000,
  'Tata Tiago': 550000,
  'Tata Tigor': 600000,
  'Tata Curvv': 1000000,
  // Hyundai
  'Hyundai Creta': 1100000,
  'Hyundai Venue': 780000,
  'Hyundai i20': 720000,
  'Hyundai Verna': 1100000,
  'Hyundai Tucson': 2800000,
  'Hyundai Alcazar': 1700000,
  'Hyundai Exter': 600000,
  'Hyundai Grand i10 Nios': 560000,
  // Mahindra
  'Mahindra Thar': 1100000,
  'Mahindra Scorpio N': 1400000,
  'Mahindra XUV700': 1400000,
  'Mahindra XUV400': 1600000,
  'Mahindra XUV300': 850000,
  'Mahindra Bolero': 950000,
  // Maruti Suzuki
  'Maruti Suzuki Swift': 600000,
  'Maruti Suzuki Baleno': 660000,
  'Maruti Suzuki Brezza': 850000,
  'Maruti Suzuki Ertiga': 870000,
  'Maruti Suzuki Fronx': 780000,
  'Maruti Suzuki Jimny': 1300000,
  'Maruti Suzuki Dzire': 680000,
  'Maruti Suzuki Alto K10': 400000,
  'Maruti Suzuki Grand Vitara': 1100000,
  'Maruti Suzuki Wagon R': 560000,
  // Kia
  'Kia Seltos': 1100000,
  'Kia Sonet': 800000,
  'Kia Carens': 1000000,
  'Kia EV6': 6100000,
  // Toyota
  'Toyota Fortuner': 3300000,
  'Toyota Innova Crysta': 2000000,
  'Toyota Innova Hycross': 1900000,
  'Toyota Glanza': 680000,
  'Toyota Urban Cruiser Hyryder': 1100000,
  // Honda
  'Honda City': 1200000,
  'Honda Amaze': 750000,
  'Honda Elevate': 1100000,
  // MG
  'MG Hector': 1500000,
  'MG Astor': 1000000,
  'MG ZS EV': 2200000,
  // Skoda / VW
  'Skoda Slavia': 1100000,
  'Skoda Kushaq': 1100000,
  'Volkswagen Taigun': 1150000,
  'Volkswagen Virtus': 1150000,
  // Luxury
  'BMW 3 Series': 4700000,
  'BMW X1': 4600000,
  'BMW X3': 6700000,
  'Mercedes-Benz C-Class': 5500000,
  'Mercedes-Benz GLC': 7400000,
  'Audi A4': 4500000,
  'Audi Q3': 4400000,
  'Audi Q5': 6500000,
  'Volvo XC40': 4500000,
  'Jaguar F-Pace': 7000000,
  'Land Rover Defender': 8500000,
};

// Brand-level average fallback
const BRAND_AVERAGES: Record<string, number> = {
  Tata: 850000,
  Hyundai: 950000,
  Mahindra: 1200000,
  'Maruti Suzuki': 700000,
  Kia: 1000000,
  Toyota: 1800000,
  Honda: 1000000,
  MG: 1200000,
  Skoda: 1100000,
  Volkswagen: 1150000,
  BMW: 5500000,
  'Mercedes-Benz': 6500000,
  Audi: 5000000,
  Volvo: 4500000,
  Jaguar: 7000000,
  'Land Rover': 8500000,
  Porsche: 12000000,
  Lexus: 6000000,
  Jeep: 2500000,
  Ford: 900000,
  Nissan: 900000,
  Renault: 800000,
  Citroen: 1000000,
};

export type Condition = 'excellent' | 'good' | 'average' | 'poor';

export interface ValuationInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: Condition;
  hasImage: boolean;
}

export interface ValuationBreakdown {
  label: string;
  detail: string;
  value: number;
}

export interface ValuationResult {
  lowPrice: number;
  highPrice: number;
  estimatedPrice: number;
  confidence: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  breakdown: ValuationBreakdown[];
  modelMatched: boolean;
}

function getBasePrice(brand: string, model: string): { price: number; matched: boolean } {
  const fullName = `${brand} ${model}`.trim();
  if (MODEL_PRICES[fullName]) return { price: MODEL_PRICES[fullName], matched: true };

  // Try partial match
  const key = Object.keys(MODEL_PRICES).find(
    (k) => k.toLowerCase() === fullName.toLowerCase()
  );
  if (key) return { price: MODEL_PRICES[key], matched: true };

  // Fallback to brand average
  const brandAvg = BRAND_AVERAGES[brand] || Object.values(BRAND_AVERAGES).reduce((a, b) => a + b, 0) / Object.values(BRAND_AVERAGES).length;
  return { price: Math.round(brandAvg), matched: false };
}

function calculateDepreciation(age: number): number {
  if (age <= 0) return 0;
  const yearRates = [0.15, 0.10, 0.10, 0.08, 0.08];
  let total = 0;
  for (let i = 0; i < age; i++) {
    total += i < yearRates.length ? yearRates[i] : 0.05;
  }
  return Math.min(total, 0.90);
}

export function calculateValuation(input: ValuationInput): ValuationResult {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - input.year);

  // Step 1: Base MSRP
  const { price: basePrice, matched: modelMatched } = getBasePrice(input.brand, input.model);

  // Step 2: Depreciation
  const depRate = calculateDepreciation(age);
  const depAmount = Math.round(basePrice * depRate);
  let value = basePrice - depAmount;

  // Step 3: Mileage adjustment
  const expectedKm = age * 12000;
  const mileageDiff = input.mileage - expectedKm;
  let mileagePercent = 0;
  if (mileageDiff < 0) {
    // Under-driven: bonus 3-6%
    mileagePercent = Math.min(0.06, Math.abs(mileageDiff) / expectedKm * 0.06 || 0.03);
  } else {
    // Over-driven: penalty 3-8%
    mileagePercent = -Math.min(0.08, (mileageDiff / (expectedKm || 12000)) * 0.08);
  }
  const mileageAdj = Math.round(value * mileagePercent);
  value += mileageAdj;

  // Step 4: Fuel type
  const fuelAdj: Record<string, number> = {
    Petrol: 0, Diesel: 0.03, Electric: 0.05, CNG: -0.02, LPG: -0.03, Hybrid: 0.04,
  };
  const fuelPercent = fuelAdj[input.fuelType] || 0;
  const fuelAmount = Math.round(value * fuelPercent);
  value += fuelAmount;

  // Step 5: Transmission
  const transAdj: Record<string, number> = {
    Manual: 0, Automatic: 0.03, CVT: 0.02, DCT: 0.04, AMT: 0.01, iMT: 0.01,
  };
  const transPercent = transAdj[input.transmission] || 0;
  const transAmount = Math.round(value * transPercent);
  value += transAmount;

  // Step 6: Condition
  const condAdj: Record<Condition, number> = {
    excellent: 0.05, good: 0.02, average: 0, poor: -0.08,
  };
  const condPercent = condAdj[input.condition];
  const condAmount = Math.round(value * condPercent);
  value += condAmount;

  // Clamp
  value = Math.max(value, Math.round(basePrice * 0.05));

  // Range
  const variance = value * 0.10;
  const lowPrice = Math.max(Math.round(value - variance), 25000);
  const highPrice = Math.round(value + variance);

  // Confidence
  let confScore = 90;
  if (!modelMatched) confScore -= 20;
  if (age > 15) confScore -= 10;
  if (input.mileage > 200000) confScore -= 10;
  if (!input.hasImage) confScore -= 5;
  confScore = Math.max(confScore, 30);

  const confidence: ValuationResult['confidence'] =
    confScore >= 75 ? 'High' : confScore >= 50 ? 'Medium' : 'Low';

  return {
    lowPrice,
    highPrice,
    estimatedPrice: Math.round(value),
    confidence,
    confidenceScore: confScore,
    modelMatched,
    breakdown: [
      { label: 'Base MSRP', detail: modelMatched ? 'Model matched' : 'Brand average', value: basePrice },
      { label: 'Age Depreciation', detail: `${age} yr${age !== 1 ? 's' : ''} · ${Math.round(depRate * 100)}%`, value: -depAmount },
      { label: 'Mileage Adjustment', detail: `${Math.round(input.mileage / 1000)}k km driven`, value: mileageAdj },
      { label: 'Fuel Type', detail: input.fuelType, value: fuelAmount },
      { label: 'Transmission', detail: input.transmission, value: transAmount },
      { label: 'Condition', detail: input.condition.charAt(0).toUpperCase() + input.condition.slice(1), value: condAmount },
    ],
  };
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `₹ ${crores.toFixed(2)} Crore`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹ ${lakhs.toFixed(2)} Lakh`;
  }
  return `₹ ${amount.toLocaleString('en-IN')}`;
}
