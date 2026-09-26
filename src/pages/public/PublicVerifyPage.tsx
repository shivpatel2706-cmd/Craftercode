import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types/certificate';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  CheckCircle2, 
  Printer, 
  ExternalLink,
  Calendar,
  Building,
  Scale,
  Award,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrintableCertificateModal } from '../../components/certificate/PrintableCertificateModal';

export const PublicVerifyPage: React.FC = () => {
  const { certificateNumber: paramCertNum } = useParams<{ certificateNumber?: string }>();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(paramCertNum || '');
  const [currentCert, setCurrentCert] = useState<Certificate | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found' | 'not_found' | 'loading'>('idle');
  const [statusNote, setStatusNote] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    if (paramCertNum) {
      setSearchInput(paramCertNum);
      performLookup(paramCertNum);
    }
  }, [paramCertNum]);

  const performLookup = async (certNo: string) => {
    if (!certNo.trim()) return;
    setSearchStatus('loading');
    
    try {
      const res = await certificateService.verifyCertificate(certNo.trim());
      if (res.found && res.certificate) {
        setCurrentCert(res.certificate);
        setStatusNote(res.statusNote || '');
        setSearchStatus('found');
      } else {
        setCurrentCert(null);
        setStatusNote(res.statusNote || 'Certificate not found or invalid.');
        setSearchStatus('not_found');
      }
    } catch (e) {
      setSearchStatus('not_found');
      setStatusNote('Network or verification service error.');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${encodeURIComponent(searchInput.trim())}`);
      performLookup(searchInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portal Home</span>
          </Link>
          <span className="text-xs font-medium text-slate-400">Public Statutory Registry</span>
        </div>

        {/* Brand Bar */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-200 mb-3">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            METROVERIFY 360
          </h1>
          <p className="text-sm font-semibold text-blue-700 mt-1 uppercase tracking-wider">
            Online Certificate Verification Portal
          </p>
          <p className="text-xs text-slate-500 max-w-lg mx-auto mt-2">
            Verify the statutory legal metrology compliance, authenticity, and validity of any weighing 
            or measuring instrument registered under the Legal Metrology Act, 2009.
          </p>
        </div>

        {/* Search / Scan Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Certificate Number (e.g. MV-CERT-2026-9041)"
                className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={searchStatus === 'loading'}
              className="px-6 py-2.5 rounded-xl font-bold whitespace-nowrap"
            >
              Verify Certificate
            </Button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Quick Test Samples:</span>
            <button
              type="button"
              onClick={() => {
                setSearchInput('MV-CERT-2026-9041');
                navigate('/verify/MV-CERT-2026-9041');
                performLookup('MV-CERT-2026-9041');
              }}
              className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md font-mono hover:bg-emerald-100 transition-colors"
            >
              MV-CERT-2026-9041 (Valid)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput('MV-CERT-2024-1090');
                navigate('/verify/MV-CERT-2024-1090');
                performLookup('MV-CERT-2024-1090');
              }}
              className="bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-md font-mono hover:bg-amber-100 transition-colors"
            >
              MV-CERT-2024-1090 (Expired)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput('MV-CERT-2024-0081');
                navigate('/verify/MV-CERT-2024-0081');
                performLookup('MV-CERT-2024-0081');
              }}
              className="bg-rose-50 text-rose-800 border border-rose-300 px-2.5 py-1 rounded-md font-mono hover:bg-rose-100 transition-colors"
            >
              MV-CERT-2024-0081 (Revoked)
            </button>
          </div>
        </div>

        {/* Result Area */}
        {searchStatus === 'loading' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-3"></div>
            <p className="text-sm font-semibold text-slate-700">Verifying statutory records against Legal Metrology Ledger...</p>
          </div>
        )}

        {searchStatus === 'not_found' && (
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldX className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-rose-900">Certificate Not Found or Invalid</h3>
            <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto leading-relaxed">
              No matching statutory verification certificate was found for the reference number entered. 
              Instruments in commercial use without valid certification are subject to seizure under the Legal Metrology Act, 2009.
            </p>
          </div>
        )}

        {searchStatus === 'found' && currentCert && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden transition-all">
            {/* Status Banner */}
            <div
              className={`p-6 border-b flex flex-col sm:flex-row items-center justify-between gap-4 ${
                currentCert.status === 'VALID'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : currentCert.status === 'EXPIRED'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    currentCert.status === 'VALID'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : currentCert.status === 'EXPIRED'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
                      : 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  }`}
                >
                  {currentCert.status === 'VALID' && <ShieldCheck className="w-8 h-8" />}
                  {currentCert.status === 'EXPIRED' && <ShieldAlert className="w-8 h-8" />}
                  {currentCert.status === 'REVOKED' && <ShieldX className="w-8 h-8" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xl sm:text-2xl font-black tracking-tight">
                      {currentCert.status === 'VALID' ? 'VALID CERTIFICATE' : currentCert.status === 'EXPIRED' ? 'EXPIRED CERTIFICATE' : 'REVOKED CERTIFICATE'}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">{statusNote}</p>
                </div>
              </div>

              <Button
                variant={currentCert.status === 'VALID' ? 'success' : 'outline'}
                size="sm"
                onClick={() => setShowPrintModal(true)}
                icon={<Printer className="w-4 h-4" />}
                className="whitespace-nowrap font-bold"
              >
                View Full Certificate
              </Button>
            </div>

            {/* Certificate Details Table */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Block 1: Certificate & Instrument */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-600" />
                    Instrument Specifications
                  </h4>
                  <dl className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Certificate Number</dt>
                      <dd className="font-mono font-bold text-slate-900">{currentCert.certificateNumber}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Instrument Name</dt>
                      <dd className="font-bold text-slate-900 text-right">{currentCert.instrumentName}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Type / Classification</dt>
                      <dd className="font-semibold text-slate-800 text-right">{currentCert.instrumentType}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Serial / Machine Number</dt>
                      <dd className="font-mono font-bold text-blue-900">{currentCert.serialNumber}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Capacity &amp; Class</dt>
                      <dd className="font-semibold text-slate-800">{currentCert.capacity} • {currentCert.accuracyClass}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Security Seal Number</dt>
                      <dd className="font-mono font-bold text-emerald-800">{currentCert.sealTagNumber}</dd>
                    </div>
                  </dl>
                </div>

                {/* Block 2: Ownership & Authority */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-600" />
                    Statutory &amp; Custody Details
                  </h4>
                  <dl className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Registered Owner</dt>
                      <dd className="font-bold text-slate-900 text-right">{currentCert.ownerName}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Installation Site</dt>
                      <dd className="text-slate-700 text-right max-w-[220px]">{currentCert.installationLocation}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Verification Date</dt>
                      <dd className="font-semibold text-blue-900">{currentCert.verificationDate}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Expiry Date</dt>
                      <dd className={`font-bold ${currentCert.status === 'EXPIRED' ? 'text-rose-700' : 'text-slate-900'}`}>
                        {currentCert.expiryDate}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <dt className="text-slate-500">Issuing Authority</dt>
                      <dd className="font-semibold text-slate-800 text-right">{currentCert.issuingAuthority}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Verifying Officer</dt>
                      <dd className="font-medium text-slate-800">
                        {currentCert.officerName} ({currentCert.officerBadge})
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Cryptographic Proof Ribbon */}
              <div className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="truncate max-w-xl">
                  <span className="text-emerald-400 font-bold">DIGITAL HASH:</span> {currentCert.digitalSignatureHash}
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Tamper Proof Ledger
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable Certificate Modal */}
      <PrintableCertificateModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        certificate={currentCert}
      />
    </div>
  );
};
