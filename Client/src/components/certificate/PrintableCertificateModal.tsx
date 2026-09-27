import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Certificate } from '../../types/certificate';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ShieldCheck, CheckCircle2, Award, Download } from 'lucide-react';

export interface PrintableCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

export const PrintableCertificateModal: React.FC<PrintableCertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const verificationUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Verification Certificate"
      subtitle={`Certificate ID: ${certificate.certificateNumber}`}
      maxWidth="3xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print / Save PDF
          </Button>
        </>
      }
    >
      {/* Official Certificate Paper Container */}
      <div className="certificate-sheet bg-white border-4 border-double border-slate-800 p-8 sm:p-10 rounded-lg relative overflow-hidden shadow-sm">
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <div className="text-center">
            <Award className="w-96 h-96 mx-auto text-slate-900" />
            <span className="text-4xl font-extrabold tracking-widest uppercase">LEGAL METROLOGY</span>
          </div>
        </div>

        {/* Certificate Header */}
        <div className="text-center border-b-2 border-slate-800 pb-5 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-50 font-serif font-black text-xl text-slate-800">
              GOI
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-slate-700">
                Government of India • Directorate of Legal Metrology
              </p>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-serif uppercase tracking-tight">
                Department of Consumer Affairs & Legal Metrology
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                {certificate.issuingAuthority} • Zone: {certificate.jurisdictionZone}
              </p>
            </div>
          </div>

          <div className="mt-4 inline-block bg-slate-900 text-white px-5 py-1 rounded-sm text-xs font-bold tracking-wider uppercase">
            Schedule VII • Certificate of Verification
          </div>
          <p className="text-[11px] text-slate-500 mt-1 italic">
            Issued under Section 24 of The Legal Metrology Act, 2009 &amp; The Legal Metrology (General) Rules, 2011
          </p>
        </div>

        {/* Certificate Status & Number Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between border border-slate-300 bg-slate-50/70 p-3 rounded-md text-xs relative z-10">
          <div>
            <span className="text-slate-500 font-medium">Certificate Ref:</span>{' '}
            <strong className="font-mono text-sm text-slate-900 font-bold ml-1">
              {certificate.certificateNumber}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Statutory Status:</span>{' '}
            <span
              className={`inline-flex items-center gap-1 font-bold ml-1 px-2 py-0.5 rounded text-xs ${
                certificate.status === 'VALID'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : certificate.status === 'EXPIRED'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {certificate.status}
            </span>
          </div>
        </div>

        {/* Legal Text */}
        <p className="mt-5 text-xs text-slate-700 leading-relaxed relative z-10 text-justify">
          This is to certify that the weighing / measuring instrument specified hereunder has been verified 
          by the designated Legal Metrology Officer in accordance with the standards, specifications, and maximum 
          permissible error (MPE) limits prescribed under the Legal Metrology (General) Rules, 2011. The statutory 
          verification seal and identification tag have been duly affixed.
        </p>

        {/* Instrument Technical Specifications Grid */}
        <div className="mt-6 border border-slate-300 rounded-md divide-y divide-slate-200 text-xs relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2.5 bg-slate-50 font-medium text-slate-600">Instrument Classification:</div>
            <div className="p-2.5 font-bold text-slate-900">{certificate.instrumentType}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2.5 bg-slate-50 font-medium text-slate-600">Instrument Model &amp; Make:</div>
            <div className="p-2.5 font-bold text-slate-900">{certificate.instrumentName} ({certificate.manufacturer} / {certificate.modelNumber})</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2.5 bg-slate-50 font-medium text-slate-600">Serial Number / Machine ID:</div>
            <div className="p-2.5 font-mono font-bold text-blue-900">{certificate.serialNumber}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2.5 bg-slate-50 font-medium text-slate-600">Capacity &amp; Accuracy Class:</div>
            <div className="p-2.5 font-bold text-slate-900">{certificate.capacity} • {certificate.accuracyClass}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2.5 bg-slate-50 font-medium text-slate-600">Owner / Authorized Business:</div>
            <div className="p-2.5 font-semibold text-slate-900">{certificate.ownerName}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2.5 bg-slate-50 font-medium text-slate-600">Installation Site:</div>
            <div className="p-2.5 text-slate-800">{certificate.installationLocation}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2.5 bg-slate-50 font-medium text-slate-600">Official Security Seal Number:</div>
            <div className="p-2.5 font-mono font-bold text-emerald-800">{certificate.sealTagNumber}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-2.5 bg-slate-50 font-medium text-slate-600">Verification Validity Period:</div>
            <div className="p-2.5 font-bold text-slate-900">
              From <span className="text-blue-800">{certificate.verificationDate}</span> To{' '}
              <span className="text-rose-800">{certificate.expiryDate}</span>
            </div>
          </div>
        </div>

        {/* Footer Signatures and QR Code */}
        <div className="mt-8 pt-6 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          {/* QR Code */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border border-slate-300 rounded shadow-sm">
              <QRCodeSVG value={verificationUrl} size={84} level="M" />
            </div>
            <div className="text-[11px] text-slate-500 max-w-[170px]">
              <p className="font-bold text-slate-800">Scan to Verify Online</p>
              <p className="text-[10px] text-slate-400 mt-0.5">METROVERIFY 360 Cloud Registry</p>
              <p className="font-mono text-[9px] text-slate-400 mt-1 break-all">{certificate.certificateNumber}</p>
            </div>
          </div>

          {/* Digital Signature & Seal Stamp */}
          <div className="text-right sm:text-right">
            <div className="inline-block border border-blue-300 bg-blue-50/70 rounded p-2 text-[10px] text-blue-950 font-mono text-left mb-2">
              <div className="flex items-center gap-1 font-bold text-blue-800">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                DIGITALLY SIGNED
              </div>
              <div>Signer: {certificate.officerName}</div>
              <div>Badge: {certificate.officerBadge}</div>
              <div className="truncate max-w-[240px]">Hash: {certificate.digitalSignatureHash}</div>
            </div>
            <div className="text-xs font-bold text-slate-900 uppercase">
              Legal Metrology Officer
            </div>
            <div className="text-[10px] text-slate-500">
              Department of Legal Metrology, NCT of Delhi
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
