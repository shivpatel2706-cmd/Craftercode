import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { instrumentService } from '../../services/instrumentService';
import { Instrument } from '../../types/instrument';
import { 
  Scale, 
  PlusCircle, 
  Search, 
  Eye, 
  Award, 
  Calendar, 
  FileText,
  MapPin,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table, Column } from '../../components/common/Table';

export const MyInstrumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = async () => {
    setLoading(true);
    try {
      const data = await instrumentService.getInstruments();
      setInstruments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = instruments.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Instrument>[] = [
    {
      key: 'name',
      header: 'Instrument Details',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.name}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {item.manufacturer} • Model {item.modelNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type & Class',
      render: (item) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{item.type}</div>
          <div className="text-[11px] text-blue-700 font-medium">{item.accuracyClass}</div>
        </div>
      ),
    },
    {
      key: 'serialNumber',
      header: 'Serial / Capacity',
      render: (item) => (
        <div>
          <div className="font-mono text-xs font-bold text-slate-800">{item.serialNumber}</div>
          <div className="text-[11px] text-slate-500">{item.capacity}</div>
        </div>
      ),
    },
    {
      key: 'installationLocation',
      header: 'Location',
      render: (item) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-[200px]" title={item.installationLocation}>
          {item.installationLocation}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-2">
          {item.status === 'Pending Re-verification' || item.status === 'Expired' ? (
            <Link to="/applicant/register-instrument">
              <Button variant="danger" size="sm" className="text-xs">
                Renew
              </Button>
            </Link>
          ) : (
            <Link to="/applicant/register-instrument">
              <Button variant="outline" size="sm" className="text-xs">
                Apply Verification
              </Button>
            </Link>
          )}
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
            My Registered Instruments
          </h1>
          <p className="text-xs text-slate-500">
            Statutory registry of commercial weighing, measuring, and dispensing devices
          </p>
        </div>
        <Link to="/applicant/register-instrument">
          <Button variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
            Register New Instrument
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, serial, or category..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'Active', label: 'Active (Verified)' },
            { value: 'Under Verification', label: 'Under Verification' },
            { value: 'Pending Re-verification', label: 'Pending Re-verification' },
            { value: 'Expired', label: 'Expired' },
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
          emptyMessage="No instruments matching criteria."
        />
      </div>
    </div>
  );
};
