export type InstrumentType = 
  | 'Non-Automatic Weighing Instrument (NAWI)'
  | 'Electronic Balance / Bench Scale'
  | 'Electronic Weighbridge'
  | 'Fuel Dispenser (MPD)'
  | 'Platform Scale'
  | 'Automatic Catchweigher'
  | 'Storage Tank Meter'
  | 'Length & Linear Measure';

export type AccuracyClass = 'Class I (Special)' | 'Class II (High)' | 'Class III (Medium)' | 'Class IV (Ordinary)';

export type PurposeOfUse = 'Commercial Retail' | 'Industrial Logistics' | 'Healthcare / Pharma' | 'Gold & Precious Metals' | 'Petroleum & Gas' | 'Agriculture';

export type InstrumentStatus = 'Active' | 'Under Verification' | 'Expired' | 'Pending Re-verification' | 'Decommissioned';

export interface Instrument {
  id: string;
  name: string;
  type: InstrumentType;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  capacity: string; // e.g. "150 kg x 10 g" or "60 Ton x 10 kg"
  accuracyClass: AccuracyClass;
  yearOfManufacture: number;
  installationLocation: string;
  purposeOfUse: PurposeOfUse;
  
  // Owner Details
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;

  // Previous Verification Details
  previousCertificateNumber?: string;
  previousVerificationDate?: string;
  expiryDate?: string;

  // Documents
  documents?: {
    previousCertificateUrl?: string;
    purchaseInvoiceUrl?: string;
    instrumentPhotoUrl?: string;
    supportingDocUrl?: string;
  };

  status: InstrumentStatus;
  currentCertificateId?: string;
  createdAt: string;
  updatedAt: string;
}
