import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { certificateService } from '../../services/certificateService';
import { Application } from '../../types/application';
import { Certificate } from '../../types/certificate';
import { 
  Search, 
  Scale, 
  Calendar, 
  UserCheck, 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Stepper } from '../../components/common/Stepper';
import { PrintableCertificateModal } from '../../components/certificate/PrintableCertificateModal';

export const ApplicationTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAppId = searchParams.get('appId') || 'APP-2026-0841';

  const [searchId, setSearchId] = useState(initialAppId);
  const [application, setApplication] = useState<Application | null>(null);
  const [associatedCert, setAssociatedCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    if (initialAppId) {
      loadApplication(initialAppId);
    }
  }, [initialAppId]);

  const loadApplication = async (id: string) => {
    setLoading(true);
    setNotFound(false);
    try {
      const app = await applicationService.getApplicationById(id.trim());
      if (app) {
        setApplication(app);
        if (app.certificateNumber) {
          const cert = await certificateService.verifyCertificate(app.certificateNumber);
          if (cert.certificate) setAssociatedCert(cert.certificate);
        } else {
          setAssociatedCert(null);
        }
      } else {
        setApplication(null);
        setNotFound(true);
      }
    } catch (e) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSearchParams({ appId: searchId.trim() });
      loadApplication(searchId.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/applicant/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">Statutory Tracking Engine</span>
      </div>

      {/* Search Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
          Statutory Application Tracking
        </h1>
        <p className="text-xs text-slate-500 mb-5">
          Monitor real-time legal metrology inspection progress across all 8 statutory verification milestones.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search by Application ID (e.g. APP-2026-0842, APP-2026-0841, APP-2026-0839)"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
              required
            />
          </div>
          <Button type="submit" variant="primary" size="md" isLoading={loading} className="font-bold px-6">
            Track Status
          </Button>
        </form>

        {/* Demo App ID quick chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Sample Applications:</span>
          {['APP-2026-0842', 'APP-2026-0841', 'APP-2026-0840', 'APP-2026-0839', 'APP-2026-0838'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSearchId(id);
                setSearchParams({ appId: id });
                loadApplication(id);
              }}
              className="font-mono text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded border border-slate-200 transition-colors"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-2"></div>
          <p className="text-sm font-semibold text-slate-700">Loading statutory progression ledger...</p>
        </div>
      )}

      {/* Not found state */}
      {notFound && !loading && (
        <div className="bg-white rounded-2xl border-2 border-rose-200 p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">Application Record Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No application was found matching "{searchId}". Please check the ID or file a new application.
          </p>
        </div>
      )}

      {/* Main Tracking Content */}
      {application && !loading && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-blue-900">
                    {application.id}
                  </span>
                  <StatusBadge status={application.status} size="sm" />
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {application.instrumentName}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Serial: {application.serialNumber} • Capacity: {application.capacity}
                </p>
              </div>

              {application.certificateNumber && (
                <div className="flex flex-col sm:items-end">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Statutory Certificate Issued
                  </span>
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg mt-1 transition-colors"
                  >
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>{application.certificateNumber}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block">Filing Date:</span>
                <span className="font-semibold text-slate-800">{application.applicationDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Officer:</span>
                <span className="font-semibold text-slate-800">
                  {application.officerName || 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Scheduled Date:</span>
                <span className="font-semibold text-slate-800">
                  {application.inspectionScheduledDate || 'To be rostered'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Statutory Fee:</span>
                <span className="font-semibold text-emerald-700">₹{application.feeAmount} (Paid)</span>
              </div>
            </div>

            {application.rejectionReason && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <strong>Rejection Notice:</strong> {application.rejectionReason}
              </div>
            )}
          </div>

          {/* Stepper Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Verification Lifecycle Progression
                </h3>
                <p className="text-xs text-slate-500">
                  Step-by-step statutory progress recorded by the Legal Metrology Directorate.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                8 Statutory Milestones
              </span>
            </div>

            {/* The Vertical Stepper */}
            <Stepper steps={application.trackingSteps} orientation="vertical" />
          </div>
        </div>
      )}

      {/* Printable Certificate Modal */}
      <PrintableCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        certificate={associatedCert}
      />
    </div>
  );
};
