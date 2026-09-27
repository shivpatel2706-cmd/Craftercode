import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { inspectionService } from '../../services/inspectionService';
import { Application } from '../../types/application';
import { Inspection } from '../../types/inspection';
import { Certificate } from '../../types/certificate';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scale, 
  Building, 
  FileText, 
  UserCheck, 
  Printer, 
  Award, 
  Image, 
  ArrowLeft,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { PrintableCertificateModal } from '../../components/certificate/PrintableCertificateModal';
import { useToast } from '../../context/ToastContext';

export const DigitalApprovalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, warning, error } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);

  // Approval Success State
  const [issuedCert, setIssuedCert] = useState<Certificate | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Action Dialogs
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReinspectModal, setShowReinspectModal] = useState(false);
  const [reinspectNotes, setReinspectNotes] = useState('');

  useEffect(() => {
    loadApprovalQueue();
  }, []);

  const loadApprovalQueue = async () => {
    setLoading(true);
    try {
      const apps = await applicationService.getApplications();
      // Prioritize apps with Inspection Completed or Pending
      const queue = apps.filter(a => a.status === 'Inspection Completed' || a.status === 'Pending' || a.status === 'Approved');
      setApplications(queue);

      const targetId = searchParams.get('appId');
      const targetApp = (targetId ? queue.find(a => a.id === targetId) : queue[0]) || apps[0];
      if (targetApp) {
        selectApplication(targetApp);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectApplication = async (app: Application) => {
    setSelectedApp(app);
    if (app.inspectionId) {
      const insp = await inspectionService.getInspectionById(app.inspectionId);
      setInspection(insp || null);
    } else {
      // Look for any inspection associated with this application
      const allInsps = await inspectionService.getInspections();
      const match = allInsps.find(i => i.applicationId === app.id);
      setInspection(match || null);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      const res = await applicationService.approveApplication(
        selectedApp.id,
        'Controller digital verification completed. Certificate issued with tamper-evident QR code.'
      );
      setIssuedCert(res.certificate);
      success('Verification approved successfully.', 'Digital Authorization Granted');
      setShowCertModal(true);
      // Reload queue
      loadApprovalQueue();
    } catch (err: any) {
      error('Failed to approve application.');
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedApp || !rejectionReason.trim()) return;
    try {
      await applicationService.rejectApplication(selectedApp.id, rejectionReason.trim());
      warning('Application rejected and notice dispatched to applicant.', 'Rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      loadApprovalQueue();
    } catch (err) {
      error('Failed to reject application');
    }
  };

  const handleReinspectionConfirm = async () => {
    if (!selectedApp) return;
    try {
      // Reset application to Assigned with notes
      await applicationService.assignOfficer(selectedApp.id, selectedApp.officerId || 'usr_officer_1');
      warning('Re-inspection requested from assigned officer.', 'Re-inspection Rostered');
      setShowReinspectModal(false);
      setReinspectNotes('');
      loadApprovalQueue();
    } catch (err) {
      error('Failed to request re-inspection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Digital Approval &amp; Certificate Generation Queue
          </h1>
          <p className="text-xs text-slate-500">
            Controller review of statutory inspection sheets, error verification within MPE, and digital sign-off
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Queue List */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Verification Queue ({applications.length})
            </span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Ready for Scrutiny
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => selectApplication(app)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedApp?.id === app.id
                    ? 'bg-blue-50/80 border-blue-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-900">{app.id}</span>
                  <StatusBadge status={app.status} size="sm" />
                </div>
                <h4 className="font-bold text-slate-900 mt-1 line-clamp-1">{app.instrumentName}</h4>
                <p className="text-slate-500 text-[11px]">{app.ownerName}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>Inspector: {app.officerName || 'Unassigned'}</span>
                  <span>{app.applicationDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center & Right: Selected Application Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {selectedApp ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-black text-blue-900">{selectedApp.id}</span>
                    <StatusBadge status={selectedApp.status} size="sm" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedApp.instrumentName}</h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Serial: {selectedApp.serialNumber} • Capacity: {selectedApp.capacity}
                  </p>
                </div>

                {/* Statutory Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedApp.status === 'Approved' ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => setShowCertModal(true)}
                      icon={<Award className="w-4 h-4" />}
                      className="font-bold"
                    >
                      View Generated Certificate
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowRejectModal(true)}
                        icon={<XCircle className="w-4 h-4" />}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReinspectModal(true)}
                        icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                      >
                        Re-inspect
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleApprove}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        className="font-bold bg-emerald-700 hover:bg-emerald-800"
                      >
                        Approve &amp; Issue QR Certificate
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Grid 1: Owner and Instrument Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Applicant &amp; Custody Details
                  </h3>
                  <div className="space-y-1.5">
                    <div><span className="text-slate-500">Applicant:</span> <strong>{selectedApp.ownerName}</strong></div>
                    <div><span className="text-slate-500">Phone:</span> <span className="font-mono">{selectedApp.ownerPhone}</span></div>
                    <div><span className="text-slate-500">Email:</span> <span className="font-mono">{selectedApp.ownerEmail}</span></div>
                    <div><span className="text-slate-500">Site:</span> {selectedApp.location}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Assigned Officer &amp; Fee Status
                  </h3>
                  <div className="space-y-1.5">
                    <div><span className="text-slate-500">Officer:</span> <strong>{selectedApp.officerName || 'Inspector S. K. Verma'}</strong></div>
                    <div><span className="text-slate-500">Badge:</span> <span className="font-mono">{selectedApp.officerBadge || 'LMI-DL-2018-044'}</span></div>
                    <div><span className="text-slate-500">Statutory Fee:</span> <strong className="text-emerald-700">₹{selectedApp.feeAmount} ({selectedApp.paymentStatus})</strong></div>
                    <div><span className="text-slate-500">Priority:</span> <span className="font-bold">{selectedApp.priority}</span></div>
                  </div>
                </div>
              </div>

              {/* Grid 2: Inspection Details & Test Verification */}
              {inspection ? (
                <div className="border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Field Inspection Findings &amp; NAWI Error Calculations
                      </h3>
                    </div>
                    <StatusBadge status={inspection.result} size="md" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block">Traceable Reference Standards:</span>
                      <strong className="text-slate-800">{inspection.measurement.standardWeightsUsed}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Zero Load Error:</span>
                      <strong className="text-emerald-700 font-mono">{inspection.measurement.zeroLoadError}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Observed Measurement:</span>
                      <strong className="text-slate-800">{inspection.measurement.observedMeasurement}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Maximum Permissible Error (MPE):</span>
                      <strong className="text-blue-800 font-mono">{inspection.measurement.permissibleError}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Repeatability &amp; Eccentricity:</span>
                      <strong className="text-slate-800">{inspection.measurement.repeatabilityResult} • {inspection.measurement.eccentricityTestResult}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Statutory Lead Seal Affixed:</span>
                      <strong className="font-mono text-emerald-800">{inspection.physical.sealTagNumber}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-1 font-semibold">Inspector Remarks:</span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg">
                      {inspection.remarks}
                    </p>
                  </div>

                  {/* Uploaded Photos */}
                  {inspection.photos && inspection.photos.length > 0 && (
                    <div>
                      <span className="text-slate-500 block mb-2 font-semibold">
                        Uploaded Inspection Proof Photos:
                      </span>
                      <div className="flex items-center gap-3">
                        {inspection.photos.map((url, idx) => (
                          <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-slate-300">
                            <img src={url} alt="Proof" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  Field inspection sheet pending upload by assigned officer.
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              Select an application from the queue to review.
            </div>
          )}
        </div>
      </div>

      {/* Reject Confirmation Dialog */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Statutory Application"
        subtitle={`Application ID: ${selectedApp?.id}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRejectConfirm}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Specify the statutory ground for rejection under the Legal Metrology Act, 2009 (e.g. error exceeded MPE, seal tampered, model unapproved).
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="Enter statutory reason for rejection..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            required
          />
        </div>
      </Modal>

      {/* Reinspection Request Dialog */}
      <Modal
        isOpen={showReinspectModal}
        onClose={() => setShowReinspectModal(false)}
        title="Request Field Re-inspection"
        subtitle={`Application ID: ${selectedApp?.id}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowReinspectModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleReinspectionConfirm}>
              Submit Request
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Instruct the assigned field officer to conduct re-testing or clarify discrepancy.
          </p>
          <textarea
            value={reinspectNotes}
            onChange={(e) => setReinspectNotes(e.target.value)}
            rows={3}
            placeholder="Instructions for re-inspection (e.g. re-verify corner 3 eccentricity)..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Modal>

      {/* Printable Certificate Modal */}
      <PrintableCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        certificate={issuedCert || (selectedApp?.certificateNumber ? {
          id: selectedApp.certificateId || 'CERT-001',
          certificateNumber: selectedApp.certificateNumber,
          applicationId: selectedApp.id,
          instrumentId: selectedApp.instrumentId,
          instrumentName: selectedApp.instrumentName,
          instrumentType: selectedApp.instrumentType,
          capacity: selectedApp.capacity,
          accuracyClass: 'Class III (Medium)',
          serialNumber: selectedApp.serialNumber,
          manufacturer: 'Verified Manufacturer',
          modelNumber: 'Model STD',
          ownerId: selectedApp.ownerId,
          ownerName: selectedApp.ownerName,
          ownerAddress: 'Plot 44-B, MIDC Industrial Area, Phase II, New Delhi',
          installationLocation: selectedApp.location,
          verificationDate: new Date().toISOString().split('T')[0],
          expiryDate: '2027-09-22',
          officerId: selectedApp.officerId || 'usr_officer_1',
          officerName: selectedApp.officerName || 'Inspector S. K. Verma',
          officerBadge: selectedApp.officerBadge || 'LMI-DL-2018-044',
          issuingAuthority: 'Department of Legal Metrology, Government of NCT of Delhi',
          jurisdictionZone: 'Central & State Metrology Division',
          sealTagNumber: 'DL-LM-SEAL-88402',
          verificationFeePaid: selectedApp.feeAmount,
          status: 'VALID',
          digitalSignatureHash: 'SHA256:7b11d99ef871020349a1bc40288f61ec9082ac32ef80231908bc129841ab77c1',
          verificationUrl: `/verify/${selectedApp.certificateNumber}`,
          qrPayload: `https://metroverify360.gov.in/verify/${selectedApp.certificateNumber}`,
          createdAt: new Date().toISOString()
        } : null)}
      />
    </div>
  );
};
