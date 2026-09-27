import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { User } from '../../types/user';
import { UserCheck, Shield, Phone, Mail, MapPin, Search } from 'lucide-react';
import { Table, Column } from '../../components/common/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';

export const ManageOfficersPage: React.FC = () => {
  const [officers, setOfficers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    setLoading(true);
    try {
      const data = await userService.getOfficers();
      setOfficers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = officers.filter(o =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.badgeNumber && o.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (o.jurisdictionZone && o.jurisdictionZone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Officer Profile',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
            alt={item.name}
            className="w-9 h-9 rounded-full border border-slate-300 object-cover"
          />
          <div>
            <div className="font-bold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-500">{item.designation}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'badgeNumber',
      header: 'Statutory Badge ID',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {item.badgeNumber}
        </span>
      ),
    },
    {
      key: 'jurisdictionZone',
      header: 'Territorial Zone',
      render: (item) => <span className="text-xs font-semibold text-slate-800">{item.jurisdictionZone}</span>,
    },
    {
      key: 'email',
      header: 'Contact',
      render: (item) => (
        <div className="text-xs">
          <div className="text-slate-700 font-mono">{item.email}</div>
          <div className="text-slate-500 font-mono text-[10px]">{item.phone}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (item) => (
        <Button variant="outline" size="sm" onClick={() => alert(`Officer ${item.name} status: Active`)}>
          View Roster
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Manage Verification Officers
        </h1>
        <p className="text-xs text-slate-500">
          Legal Metrology Inspectors (LMIs), Assistant Controllers, and territorial allocations
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search officers by name, badge ID, or territorial zone..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No officers matching search."
        />
      </div>
    </div>
  );
};
