import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types/application';
import { 
  FileText, 
  Search, 
  Eye, 
  Calendar, 
  PlusCircle, 
  UserCheck, 
  Clock 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table, Column } from '../../components/common/Table';

export const ApplicantApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplications();
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Application>[] = [
    {
      key: 'id',
      header: 'Application ID',
      render: (item) => (
        <span className="font-mono font-bold text-blue-700">{item.id}</span>
      ),
    },
    {
      key: 'instrumentName',
      header: 'Instrument',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.instrumentName}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {item.serialNumber} • {item.capacity}
          </div>
        </div>
      ),
    },
    {
      key: 'applicationDate',
      header: 'Date Filed',
      render: (item) => <span className="text-xs">{item.applicationDate}</span>,
    },
    {
      key: 'inspectionScheduledDate',
      header: 'Inspection Date',
      render: (item) => (
        <span className="text-xs">
          {item.inspectionScheduledDate ? (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {item.inspectionScheduledDate}
            </span>
          ) : (
            <span className="text-slate-400 italic">Not scheduled</span>
          )}
        </span>
      ),
    },
    {
      key: 'officerName',
      header: 'Assigned Officer',
      render: (item) => (
        <span className="text-xs">
          {item.officerName ? (
            <div>
              <div className="font-medium text-slate-800">{item.officerName}</div>
              <div className="text-[10px] text-slate-400 font-mono">{item.officerBadge}</div>
            </div>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          )}
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
          <Link to={`/applicant/tracking?appId=${item.id}`}>
            <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
              Track Progression
            </Button>
          </Link>
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
            Verification Applications
          </h1>
          <p className="text-xs text-slate-500">
            Real-time status of statutory verification filings under Legal Metrology Act 2009
          </p>
        </div>
        <Link to="/applicant/register-instrument">
          <Button variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
            Apply for Verification
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ID, instrument name, serial..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Filter Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'Pending', label: 'Pending Review' },
            { value: 'Assigned', label: 'Officer Assigned' },
            { value: 'Inspection Scheduled', label: 'Inspection Scheduled' },
            { value: 'Inspection Completed', label: 'Inspection Completed' },
            { value: 'Approved', label: 'Approved & Issued' },
            { value: 'Rejected', label: 'Rejected' },
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
          emptyMessage="No applications matching criteria."
        />
      </div>
    </div>
  );
};
