import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { userService } from '../../services/userService';
import { Application } from '../../types/application';
import { User } from '../../types/user';
import { 
  FileText, 
  Search, 
  UserCheck, 
  Eye, 
  CheckCircle2, 
  Calendar, 
  Check 
} from 'lucide-react';
import { Table, Column } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

export const ManageApplicationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Assign Officer Modal
  const [assignApp, setAssignApp] = useState<Application | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, offList] = await Promise.all([
        applicationService.getApplications(),
        userService.getOfficers(),
      ]);
      setApplications(apps);
      setOfficers(offList);
      if (offList.length > 0) setSelectedOfficerId(offList[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignApp || !selectedOfficerId) return;

    try {
      await applicationService.assignOfficer(assignApp.id, selectedOfficerId, scheduledDate || undefined);
      success(`Assigned officer to ${assignApp.id}`, 'Officer Designated');
      setAssignApp(null);
      loadData();
    } catch (err) {
      error('Failed to assign officer');
    }
  };

  const filtered = applications.filter(app => {
    const matchSearch =
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pageSize = 8;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: Column<Application>[] = [
    {
      key: 'id',
      header: 'App ID',
      render: (item) => <span className="font-mono font-bold text-blue-900">{item.id}</span>,
    },
    {
      key: 'instrumentName',
      header: 'Instrument Details',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.instrumentName}</div>
          <div className="text-[11px] text-slate-500 font-mono">S/N: {item.serialNumber}</div>
        </div>
      ),
    },
    {
      key: 'ownerName',
      header: 'Applicant',
      render: (item) => <span className="text-xs text-slate-800">{item.ownerName}</span>,
    },
    {
      key: 'officerName',
      header: 'Assigned Officer',
      render: (item) => (
        <span className="text-xs">
          {item.officerName ? (
            <span className="font-medium text-slate-800">{item.officerName}</span>
          ) : (
            <span className="text-amber-700 font-semibold italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Unassigned
            </span>
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
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAssignApp(item);
              setSelectedOfficerId(item.officerId || (officers[0]?.id || ''));
              setScheduledDate(item.inspectionScheduledDate || '');
            }}
            icon={<UserCheck className="w-3.5 h-3.5" />}
          >
            Assign
          </Button>

          <Link to={`/admin/approvals?appId=${item.id}`}>
            <Button variant="primary" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
              Review
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Manage Verification Applications
        </h1>
        <p className="text-xs text-slate-500">
          Statutory application registry, officer assignments, and clearance monitoring
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search applications..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Assigned', label: 'Assigned' },
            { value: 'Inspection Scheduled', label: 'Inspection Scheduled' },
            { value: 'Inspection Completed', label: 'Inspection Completed' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={paginated}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No applications found matching criteria."
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={pageSize}
        />
      </div>

      {/* Assign Officer Modal */}
      <Modal
        isOpen={!!assignApp}
        onClose={() => setAssignApp(null)}
        title="Assign Legal Metrology Officer"
        subtitle={`Application ID: ${assignApp?.id} • ${assignApp?.instrumentName}`}
        maxWidth="md"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Territorial Officer
            </label>
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-600"
              required
            >
              {officers.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.name} ({off.badgeNumber}) — {off.jurisdictionZone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Rostered Inspection Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAssignApp(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
