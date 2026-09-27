import { apiClient, requestWithFallback } from './api';
import { storage } from './storage';
import { Certificate } from '../types/certificate';

export const certificateService = {
  async getCertificates(): Promise<Certificate[]> {
    return requestWithFallback(
      () => apiClient.get('/certificates'),
      () => storage.getCertificates()
    );
  },

  async getCertificateById(id: string): Promise<Certificate | undefined> {
    return requestWithFallback(
      () => apiClient.get(`/certificates/${id}`),
      () => storage.getCertificateById(id)
    );
  },

  async verifyCertificate(certificateNumber: string): Promise<{
    found: boolean;
    certificate?: Certificate;
    statusNote?: string;
  }> {
    return requestWithFallback(
      async () => {
        const res = await apiClient.get(`/certificates/verify/${encodeURIComponent(certificateNumber)}`);
        const data = (res.data && 'data' in res.data) ? res.data.data : res.data;
        if (data && data.found) {
          const cert: Certificate = {
            id: data.certificateNumber,
            certificateNumber: data.certificateNumber,
            applicationId: 'APP-STATUTORY',
            instrumentId: 'INST-STATUTORY',
            instrumentName: data.instrumentName || 'Verified Weighing/Measuring Instrument',
            instrumentType: 'NAWI',
            capacity: 'Industrial / Commercial Range',
            accuracyClass: 'Class III',
            serialNumber: data.serialNumber || 'N/A',
            manufacturer: 'Statutory Verified Manufacturer',
            modelNumber: 'LM-COMPLIANT',
            ownerId: 'OWNER-001',
            ownerName: 'Authorized Commercial Holder',
            ownerAddress: 'Registered Commercial Premises',
            installationLocation: 'Verified Commercial Operating Premises',
            verificationDate: data.verificationDate,
            expiryDate: data.expiryDate,
            officerId: 'OFFICER-001',
            officerName: 'Inspector of Legal Metrology',
            officerBadge: 'LMI-STATUTORY',
            issuingAuthority: data.issuingAuthority || 'Department of Legal Metrology, Government of India',
            jurisdictionZone: 'National / Territorial Zone',
            sealTagNumber: data.sealTagNumber,
            verificationFeePaid: 1500,
            status: data.status as 'VALID' | 'EXPIRED' | 'REVOKED',
            digitalSignatureHash: data.digitalSignatureHash,
            verificationUrl: `https://metroverify360.gov.in/verify/${data.certificateNumber}`,
            qrPayload: `CERT:${data.certificateNumber}|SEAL:${data.sealTagNumber}|HASH:${data.digitalSignatureHash}`,
            revocationReason: data.status === 'REVOKED' ? data.message : undefined,
            createdAt: data.verificationDate
          };

          return {
            found: true,
            certificate: cert,
            statusNote: data.message
          };
        }

        return {
          found: false,
          statusNote: data?.message || 'Certificate not found or invalid. Please check the reference number.'
        };
      },
      () => {
        const cert = storage.getCertificateByNumber(certificateNumber);
        if (!cert) {
          return {
            found: false,
            statusNote: 'Certificate not found or invalid. Please check the reference number.'
          };
        }
        
        let statusNote = 'Verified authentic statutory certificate under Legal Metrology Act 2009.';
        if (cert.status === 'EXPIRED') {
          statusNote = 'Certificate has expired. Instrument requires re-verification for legal commercial use.';
        } else if (cert.status === 'REVOKED') {
          statusNote = cert.revocationReason || 'This certificate has been revoked by the Controller of Legal Metrology.';
        }

        return {
          found: true,
          certificate: cert,
          statusNote
        };
      }
    );
  },

  async revokeCertificate(id: string, reason: string): Promise<Certificate> {
    const cert = storage.getCertificateById(id);
    if (!cert) throw new Error('Certificate not found');
    cert.status = 'REVOKED';
    cert.revocationReason = reason;
    cert.revocationDate = new Date().toISOString().split('T')[0];
    storage.saveCertificate(cert);
    storage.addAuditLog({
      userName: 'Administrator',
      userRole: 'Administrator',
      action: 'CERTIFICATE_REVOKED',
      entityType: 'Certificate',
      entityId: cert.certificateNumber,
      details: `Revoked certificate ${cert.certificateNumber}: ${reason}`,
      ipAddress: '10.14.22.105',
      status: 'WARNING'
    });
    return cert;
  }
};
