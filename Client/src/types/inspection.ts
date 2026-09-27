export type InspectionResult = 'PASS' | 'FAIL' | 'REQUIRES REINSPECTION';

export interface PhysicalInspectionData {
  instrumentCondition: 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  manufacturerDetailsVerified: boolean;
  serialNumberVerified: boolean;
  sealCondition: 'Intact' | 'Broken' | 'Missing' | 'Tampered' | 'Not Applicable (New)';
  displayCondition: 'Clear & Readable' | 'Flickering' | 'Faulty Segments' | 'Analog Needle Defective';
  levelIndicatorOk: boolean;
  leadAndWireSealAffixed: boolean;
  sealTagNumber: string;
}

export interface MeasurementVerificationData {
  standardWeightsUsed: string; // e.g. "OIML Class M1 Standard Weights (Cert # RRSL/2026/0411)"
  zeroLoadError: string; // e.g. "0.0 g (Within +/- 0.5 e)"
  observedMeasurement: string; // e.g. "50.00 kg against 50.00 kg standard"
  permissibleError: string; // e.g. "+/- 10 g (MPE under OIML R76)"
  repeatabilityResult: 'Satisfactory (Range < 1 e)' | 'Unsatisfactory';
  eccentricityTestResult: 'Pass (Corners within MPE)' | 'Fail (Corner error exceeds MPE)';
  accuracyTestResult: 'Pass' | 'Fail';
  testLoadPoints?: string; // e.g. "Min (200g), 50kg, 100kg, Max (150kg)"
}

export interface DocumentationVerificationData {
  modelApprovalVerified: boolean;
  modelApprovalNumber: string;
  previousCertificateVerified: boolean;
  userManualAvailable: boolean;
  taxInvoiceVerified: boolean;
}

export interface Inspection {
  id: string;
  applicationId: string;
  instrumentId: string;
  officerId: string;
  officerName: string;
  officerBadge: string;
  inspectionDate: string;
  location: string;
  
  // Sections
  physical: PhysicalInspectionData;
  measurement: MeasurementVerificationData;
  documentation: DocumentationVerificationData;
  
  result: InspectionResult;
  remarks: string;
  photos: string[];
  status: 'Draft' | 'Submitted' | 'Reviewed';
  submittedAt?: string;
  reinspectionReason?: string;
}
