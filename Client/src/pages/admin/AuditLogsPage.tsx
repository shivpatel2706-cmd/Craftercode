import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { AuditLog } from '../../types/notification';
import { History, Search, Filter, ShieldCheck, Download } from 'lucide-react';
import { Table, Column } from '../../components/common/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { Button } from '../../components/common/Button';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await userService.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l => {
    const matchSearch =
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEntity = entityFilter === 'ALL' || l.entityType === entityFilter;
    return matchSearch && matchEntity;
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item) => <span className="font-mono text-xs text-slate-700">{item.timestamp}</span>,
    },
    {
      key: 'userName',
      header: 'User & Role',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{item.userName}</div>
          <div className="text-[10px] text-slate-500 font-medium">{item.userRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {item.action}
        </span>
      ),
    },
    {
      key: 'entityType',
      header: 'Entity / Ref',
      render: (item) => (
        <div className="text-xs font-mono">
          <span className="text-slate-500 block">{item.entityType}</span>
          <span className="font-bold text-slate-800">{item.entityId}</span>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Audit Description',
      render: (item) => (
        <div className="text-xs text-slate-700 max-w-md leading-relaxed">
          {item.details}
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">IP: {item.ipAddress}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-right',
      render: (item) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            item.status === 'SUCCESS'
              ? 'bg-emerald-100 text-emerald-800'
              : item.status === 'WARNING'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Statutory Audit &amp; Compliance Logs
          </h1>
          <p className="text-xs text-slate-500">
            Immutable audit record of all statutory verifications, certificate issuances, and officer decisions
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={() => alert('Exporting statutory audit ledger (CSV format)...')}
        >
          Export Audit Trail
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search audit trail by actor, action, reference ID..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Entity Type"
          value={entityFilter}
          onChange={setEntityFilter}
          options={[
            { value: 'ALL', label: 'All Entities' },
            { value: 'Application', label: 'Application' },
            { value: 'Instrument', label: 'Instrument' },
            { value: 'Inspection', label: 'Inspection' },
            { value: 'Certificate', label: 'Certificate' },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No audit records found matching criteria."
        />
      </div>
    </div>
  );
};
