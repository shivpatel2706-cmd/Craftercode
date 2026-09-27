import React, { useState, useEffect } from 'react';
import { instrumentService } from '../../services/instrumentService';
import { Instrument } from '../../types/instrument';
import { Scale, Search, Eye, Filter } from 'lucide-react';
import { Table, Column } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';

export const ManageInstrumentsPage: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
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

  const filtered = instruments.filter(i => {
    const matchSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pageSize = 8;
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: Column<Instrument>[] = [
    {
      key: 'name',
      header: 'Instrument',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.name}</div>
          <div className="text-[11px] text-slate-500">{item.manufacturer} • {item.modelNumber}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category & Accuracy',
      render: (item) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{item.type}</div>
          <div className="text-blue-700 font-medium text-[11px]">{item.accuracyClass}</div>
        </div>
      ),
    },
    {
      key: 'serialNumber',
      header: 'Serial / Capacity',
      render: (item) => (
        <div className="text-xs font-mono">
          <div className="font-bold text-slate-900">{item.serialNumber}</div>
          <div className="text-slate-500">{item.capacity}</div>
        </div>
      ),
    },
    {
      key: 'ownerName',
      header: 'Owner / Premises',
      render: (item) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900">{item.ownerName}</div>
          <div className="text-slate-500 line-clamp-1 max-w-[160px]">{item.installationLocation}</div>
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
      header: 'Action',
      className: 'text-right',
      render: (item) => (
        <Button variant="outline" size="sm" onClick={() => alert(`Instrument ${item.serialNumber} details viewed`)}>
          View Passport
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          National Instrument Registry
        </h1>
        <p className="text-xs text-slate-500">
          Central statutory ledger of all commercial, healthcare, and industrial measuring instruments
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by instrument name, serial number, owner..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Filter Status"
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={paginated}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No instruments found matching criteria."
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={pageSize}
        />
      </div>
    </div>
  );
};
