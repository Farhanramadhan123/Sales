export interface HistoryItem {
  id: number;
  createdAt: string;
  borrowerName: string;
  salesName: string;
  status: string;
  
  // Data Unit
  unitName: string;
  category: string;
  nopol?: string;
  
  // Data Angka Penting
  vehiclePrice: number;
  dpPercent: number;
  dpAmount: number;
  principalPure: number | null; 
  
  tenor: number;
  interestRate: number | null;
  totalInterest: number | null;
  
  insuranceLabel: string | null;
  insuranceRate: number | null;
  insuranceAmount: number | null;
  policyFee: number | null;
  totalAR: number | null;
  
  totalLoan: number | null; 
  monthlyPayment: number;
  nilaiAP: number | null;
  
  // TDP Detail
  adminFee: number;
  policyFeeTDP: number | null;
  firstInstallment: number | null;
  totalFirstPay: number; 
  paymentType: string;
}