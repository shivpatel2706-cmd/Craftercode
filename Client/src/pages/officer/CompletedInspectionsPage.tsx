import React, { useState, useEffect } from 'react';
import { inspectionService } from '../../services/inspectionService';
import { Inspection } from '../../types/inspection';
import { 
  CheckCircle2, 
  Search, 
  FileText, 
  MapPin, 
  Calendar, 
  Award,
  Eye
} from 'lucide-react';
import { Table, Column } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

export const CompletedInspectionsPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInsp, setSelectedInsp] = useState<Inspection | null>(null);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setLoading(true);
    try {
      const data = await inspectionService.getInspections();
      setInspections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = inspections.filter(i =>
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Inspection>[] = [
    {
      key: 'id',
      header: 'Inspection ID',
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-blue-900 block">{item.id}</span>
          <span className="text-[10px] text-slate-400 font-mono">App: {item.applicationId}</span>
        </div>
      ),
    },
    {
      key: 'inspectionDate',
      header: 'Date Conducted',
      render: (item) => <span className="text-xs font-semibold text-slate-800">{item.inspectionDate}</span>,
    },
    {
      key: 'location',
      header: 'Inspection Site',
      render: (item) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-[200px]" title={item.location}>
          {item.location}
        </span>
      ),
    },
    {
      key: 'sealTagNumber',
      header: 'Seal Tag #',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-emerald-800">
          {item.physical.sealTagNumber}
        </span>
      ),
    },
    {
      key: 'result',
      header: 'Result',
      render: (item) => <StatusBadge status={item.result} size="sm" />,
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedInsp(item)}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          View Test Sheet
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Completed Statutory Inspections Archive
        </h1>
        <p className="text-xs text-slate-500">
          Historical record of physical and metrological accuracy test sheets filed by this inspector
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by inspection ID, application ID, or site location..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No completed inspections recorded."
        />
      </div>

      {/* Test Sheet Modal */}
      <Modal
        isOpen={!!selectedInsp}
        onClose={() => setSelectedInsp(null)}
        title="Statutory Field Inspection Sheet"
        subtitle={`Report ID: ${selectedInsp?.id} • App: ${selectedInsp?.applicationId}`}
        maxWidth="2xl"
        footer={
          <Button variant="outline" size="sm" onClick={() => setSelectedInsp(null)}>
            Close
          </Button>
        }
      >
        {selectedInsp && (
          <div className="space-y-5 text-xs">
            {/* Header Result */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium">Verifying Officer:</span>{' '}
                <strong className="text-slate-900">{selectedInsp.officerName}</strong> ({selectedInsp.officerBadge})
              </div>
              <StatusBadge status={selectedInsp.result} size="md" />
            </div>

            {/* Test readings */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                Metrological Verification Data
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">Standards Used:</span> <strong>{selectedInsp.measurement.standardWeightsUsed}</strong></div>
                <div><span className="text-slate-500">Zero Load Error:</span> <strong>{selectedInsp.measurement.zeroLoadError}</strong></div>
                <div><span className="text-slate-500">Observed Measurement:</span> <strong>{selectedInsp.measurement.observedMeasurement}</strong></div>
                <div><span className="text-slate-500">Permissible Error (MPE):</span> <strong>{selectedInsp.measurement.permissibleError}</strong></div>
                <div><span className="text-slate-500">Repeatability Result:</span> <strong>{selectedInsp.measurement.repeatabilityResult}</strong></div>
                <div><span className="text-slate-500">Seal Affixed:</span> <strong className="font-mono text-emerald-700">{selectedInsp.physical.sealTagNumber}</strong></div>
              </div>
            </div>

            {/* Remarks */}
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                Official Remarks
              </h4>
              <p className="text-slate-700 leading-relaxed">{selectedInsp.remarks}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
