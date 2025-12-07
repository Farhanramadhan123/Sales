// app/types/simulation.ts

export interface DbInterest {
  id: number;
  category: string;
  paymentType: string;
  star: number;
  tenor: number;
  rate: number;
}

export interface DbInsurance {
  id: number;
  category: string;
  tenor: number;
  label: string;
  minPrice: number;
  maxPrice: number;
  rate: number;
}

export interface AppData {
  interestRates: DbInterest[];
  insuranceRates: DbInsurance[];
}

// Struktur data untuk file Base64
export interface AttachmentItem {
  name: string;
  type: string;
  size: number;
  base64: string;
}

export interface SimulationForm {
  mode: 'NORMAL' | 'BUDGET';
  targetType: 'TDP' | 'INSTALLMENT';
  targetValue: number;

  borrowerName: string;
  coBorrowerName: string;
  salesName: string;
  status: string;
  
  attachments: AttachmentItem[];

  unitName: string;
  nopol: string;
  category: 'PASSENGER' | 'COMMERCIAL';
  subCategory: 'PASSENGER' | 'TRUCK' | 'BUS';
  isLoadingUnit: boolean;
  price: number;

  dpPercent: number;
  tenor: number;
  paymentType: 'ADDB' | 'ADDM';
  adminFee: number;
  selectedInsuranceLabel: string;
}

export interface CalculationResult {
  starLevel: number;
  interestRatePct: number;
  insuranceRatePct: number;

  vehiclePrice: number;
  dpAmount: number;
  dpPercentCalc: number;
  principalPure: number;
  insuranceAmount: number;
  policyFee: number;

  totalAR: number;
  totalInterest: number;
  totalLoan: number;
  monthlyInstallment: number;

  adminFee: number;
  policyFeeTDP: number;
  firstInstallment: number;
  totalDownPayment: number;

  nilaiAP: number;
  installmentDivisor: number;
  isSpecialScenario: boolean;
}