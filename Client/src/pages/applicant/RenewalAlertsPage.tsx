import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { certificateService } from '../../services/certificateService';
import { RenewalAlert } from '../../types/notification';
import { Certificate } from '../../types/certificate';
import { 
  BellRing, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Award, 
  Printer, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Table, Column } from '../../components/common/Table';
import { PrintableCertificateModal } from '../../components/certificate/PrintableCertificateModal';

export const RenewalAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<RenewalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getRenewalAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCert = async (certNo: string) => {
    const res = await certificateService.verifyCertificate(certNo);
    if (res.certificate) {
      setSelectedCert(res.certificate);
    } else {
      alert('Certificate details not found.');
    }
  };

  const columns: Column<RenewalAlert>[] = [
    {
      key: 'certificateNumber',
      header: 'Certificate Ref',
      render: (item) => (
        <span className="font-mono font-bold text-blue-800 text-xs">
          {item.certificateNumber}
        </span>
      ),
    },
    {
      key: 'instrumentName',
      header: 'Instrument',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{item.instrumentName}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {item.instrumentType} • S/N: {item.serialNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (item) => (
        <span className="font-semibold text-slate-800 text-xs">{item.expiryDate}</span>
      ),
    },
    {
      key: 'daysRemaining',
      header: 'Days Remaining',
      render: (item) => (
        <div>
          {item.daysRemaining > 0 ? (
            <span
              className={`font-bold text-xs px-2 py-0.5 rounded-full inline-block ${
                item.daysRemaining <= 15
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {item.daysRemaining} Days
            </span>
          ) : (
            <span className="font-bold text-xs bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded-full inline-block">
              Expired ({Math.abs(item.daysRemaining)}d ago)
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${
            item.status === 'Expiring Soon'
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : item.status === 'Due Immediately'
              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
              : 'bg-red-100 text-red-900 border border-red-300'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewCert(item.certificateNumber)}
            className="text-xs"
          >
            View Certificate
          </Button>

          <Link to="/applicant/register-instrument">
            <Button
              variant="danger"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs font-bold whitespace-nowrap"
            >
              Apply for Renewal
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Statutory Renewal Alerts
          </h1>
          <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <BellRing className="w-3 h-3" />
            Mandatory Re-verification
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Instruments requiring statutory periodic re-verification under the Legal Metrology (General) Rules, 2011
        </p>
      </div>

      {/* Advisory Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Statutory Compliance Notice:</strong> Using unverified or expired weighing or measuring instruments in commercial trade 
          is an offense punishable under Section 30 of The Legal Metrology Act, 2009. Please ensure re-verification applications 
          are filed at least 15 days prior to expiration.
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={alerts}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No renewal alerts currently active."
        />
      </div>

      {/* Printable Certificate Modal */}
      <PrintableCertificateModal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />
    </div>
  );
};
