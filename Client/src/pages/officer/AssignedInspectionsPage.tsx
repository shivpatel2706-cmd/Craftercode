import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types/application';
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Smartphone,
  Eye
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table, Column } from '../../components/common/Table';

export const AssignedInspectionsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      app.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || app.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const columns: Column<Application>[] = [
    {
      key: 'id',
      header: 'Application ID',
      render: (item) => (
        <span className="font-mono font-bold text-blue-800">{item.id}</span>
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
      key: 'ownerName',
      header: 'Owner',
      render: (item) => <span className="text-xs text-slate-800">{item.ownerName}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-[200px]" title={item.location}>
          {item.location}
        </span>
      ),
    },
    {
      key: 'inspectionScheduledDate',
      header: 'Scheduled Date',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-800">
          {item.inspectionScheduledDate || 'Not scheduled'}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => (
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            item.priority === 'High' || item.priority === 'Urgent'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.priority}
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
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-1.5">
          <Link to={`/officer/field-inspection?appId=${item.id}`}>
            <Button variant="primary" size="sm" className="text-xs font-bold whitespace-nowrap">
              Perform Test
            </Button>
          </Link>
          <Link to={`/applicant/tracking?appId=${item.id}`}>
            <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />} title="View Details" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Assigned Inspections Roster
        </h1>
        <p className="text-xs text-slate-500">
          Territorial inspections assigned to your Legal Metrology Inspector badge
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ID, instrument, owner, location..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { value: 'ALL', label: 'All Priorities' },
            { value: 'Normal', label: 'Normal' },
            { value: 'High', label: 'High Priority' },
            { value: 'Urgent', label: 'Urgent' },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No assigned inspections found."
        />
      </div>
    </div>
  );
};
