import React, { useState, useEffect } from 'react';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types/certificate';
import { 
  Award, 
  Search, 
  Printer, 
  ShieldAlert, 
  ShieldCheck, 
  XCircle, 
  QrCode,
  AlertTriangle 
} from 'lucide-react';
import { Table, Column } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PrintableCertificateModal } from '../../components/certificate/PrintableCertificateModal';
import { useToast } from '../../context/ToastContext';

export const ManageCertificatesPage: React.FC = () => {
  const { success, warning } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedForPrint, setSelectedForPrint] = useState<Certificate | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getCertificates();
      setCertificates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget || !revokeReason.trim()) return;
    try {
      await certificateService.revokeCertificate(revokeTarget.id, revokeReason.trim());
      warning(`Certificate ${revokeTarget.certificateNumber} revoked.`, 'Certificate Revoked');
      setRevokeTarget(null);
      setRevokeReason('');
      loadCertificates();
    } catch (e) {
      alert('Error revoking certificate');
    }
  };

  const filtered = certificates.filter(c => {
    const matchSearch =
      c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: Column<Certificate>[] = [
    {
      key: 'certificateNumber',
      header: 'Certificate Ref',
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-blue-900 block">{item.certificateNumber}</span>
          <span className="text-[10px] text-slate-400 font-mono">App: {item.applicationId}</span>
        </div>
      ),
    },
    {
      key: 'instrumentName',
      header: 'Instrument',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.instrumentName}</div>
          <div className="text-[11px] text-slate-500 font-mono">S/N: {item.serialNumber}</div>
        </div>
      ),
    },
    {
      key: 'ownerName',
      header: 'Owner',
      render: (item) => <span className="text-xs text-slate-800">{item.ownerName}</span>,
    },
    {
      key: 'verificationDate',
      header: 'Validity Period',
      render: (item) => (
        <div className="text-xs">
          <span className="text-slate-500">From {item.verificationDate}</span>
          <span className={`block font-semibold ${item.status === 'EXPIRED' ? 'text-rose-700' : 'text-slate-800'}`}>
            To {item.expiryDate}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'action',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedForPrint(item)}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            PDF
          </Button>

          {item.status === 'VALID' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setRevokeTarget(item);
                setRevokeReason('Statutory seal broken or alteration detected during market surveillance inspection.');
              }}
              className="text-xs"
            >
              Revoke
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Manage Verification Certificates
        </h1>
        <p className="text-xs text-slate-500">
          Official statutory certificate ledger, revocations, and public verification status
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search certificate number, instrument, owner..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'VALID', label: 'VALID' },
            { value: 'EXPIRED', label: 'EXPIRED' },
            { value: 'REVOKED', label: 'REVOKED' },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No certificates found."
        />
      </div>

      {/* Revocation Modal */}
      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Statutory Verification Certificate"
        subtitle={`Certificate Ref: ${revokeTarget?.certificateNumber}`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRevokeTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRevokeConfirm}>
              Confirm Revocation
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Revoking a certificate invalidates its legal authority immediately. Notice will be published to the public registry.
          </p>
          <textarea
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            rows={3}
            placeholder="Grounds for revocation under Section 24 of Legal Metrology Act..."
            className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
            required
          />
        </div>
      </Modal>

      {/* Printable Certificate Modal */}
      <PrintableCertificateModal
        isOpen={!!selectedForPrint}
        onClose={() => setSelectedForPrint(null)}
        certificate={selectedForPrint}
      />
    </div>
  );
};
