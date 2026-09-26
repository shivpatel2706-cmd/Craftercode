export type CertificateStatus = 'VALID' | 'EXPIRED' | 'REVOKED';

export interface Certificate {
  id: string;
  certificateNumber: string; // e.g. "MV-CERT-2026-9041"
  applicationId: string;
  instrumentId: string;
  instrumentName: string;
  instrumentType: string;
  capacity: string;
  accuracyClass: string;
  serialNumber: string;
  manufacturer: string;
  modelNumber: string;
  
  // Owner info
  ownerId: string;
  ownerName: string;
  ownerAddress: string;
  installationLocation: string;

  // Verification details
  verificationDate: string;
  expiryDate: string;
  officerId: string;
  officerName: string;
  officerBadge: string;
  issuingAuthority: string; // e.g. "Legal Metrology Department, Government of National Capital Territory"
  jurisdictionZone: string;
  sealTagNumber: string;
  verificationFeePaid: number;
  
  // Status and Security
  status: CertificateStatus;
  digitalSignatureHash: string;
  verificationUrl: string;
  qrPayload: string;
  revocationReason?: string;
  revocationDate?: string;
  createdAt: string;
}
