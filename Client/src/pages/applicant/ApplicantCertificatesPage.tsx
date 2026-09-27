import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types/certificate';
import { 
  Award, 
  Search, 
  Eye, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Download,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { QRCodeDisplay } from '../../components/common/QRCodeDisplay';
import { PrintableCertificateModal } from '../../components/certificate/PrintableCertificateModal';

export const ApplicantCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedCertForPrint, setSelectedCertForPrint] = useState<Certificate | null>(null);
  const [selectedCertForQR, setSelectedCertForQR] = useState<Certificate | null>(null);

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

  const filtered = certificates.filter((cert) => {
    const matchesSearch =
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      header: 'Instrument Details',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.instrumentName}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            S/N: {item.serialNumber} • {item.capacity}
          </div>
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
          <div className="text-slate-600">From: {item.verificationDate}</div>
          <div className={`font-semibold ${item.status === 'EXPIRED' ? 'text-rose-600' : 'text-slate-900'}`}>
            To: {item.expiryDate}
          </div>
        </div>
      ),
    },
    {
      key: 'officerName',
      header: 'Verifying Officer',
      render: (item) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800">{item.officerName}</div>
          <div className="text-[10px] text-slate-400 font-mono">{item.officerBadge}</div>
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
            onClick={() => setSelectedCertForQR(item)}
            icon={<QrCode className="w-3.5 h-3.5 text-blue-700" />}
            title="Inspect QR Code"
          >
            QR
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setSelectedCertForPrint(item)}
            icon={<Printer className="w-3.5 h-3.5" />}
            title="Print or View Certificate"
          >
            View / PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Statutory Verification Certificates
          </h1>
          <p className="text-xs text-slate-500">
            Digital Certificate of Verification (Schedule VII) under Legal Metrology Act 2009
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by certificate ref, machine serial, app ID..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'All Certificates' },
            { value: 'VALID', label: 'VALID (Active)' },
            { value: 'EXPIRED', label: 'EXPIRED' },
            { value: 'REVOKED', label: 'REVOKED' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No certificates matching criteria."
        />
      </div>

      {/* QR Code Inspection Modal */}
      <Modal
        isOpen={!!selectedCertForQR}
        onClose={() => setSelectedCertForQR(null)}
        title="Statutory QR Code Verification"
        subtitle={`Instrument: ${selectedCertForQR?.instrumentName}`}
        maxWidth="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelectedCertForQR(null)} className="w-full">
            Done
          </Button>
        }
      >
        {selectedCertForQR && (
          <div className="py-2">
            <QRCodeDisplay
              value={selectedCertForQR.qrPayload}
              certificateNumber={selectedCertForQR.certificateNumber}
              size={180}
              includeLink={true}
            />
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
              <span className="font-semibold block text-slate-800 mb-1">Affixing Instructions:</span>
              Print this QR badge and affix securely near the physical verification seal plate on the instrument.
            </div>
          </div>
        )}
      </Modal>

      {/* Printable Certificate Modal */}
      <PrintableCertificateModal
        isOpen={!!selectedCertForPrint}
        onClose={() => setSelectedCertForPrint(null)}
        certificate={selectedCertForPrint}
      />
    </div>
  );
};
