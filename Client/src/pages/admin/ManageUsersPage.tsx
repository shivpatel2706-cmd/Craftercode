import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { User } from '../../types/user';
import { Users, Search, UserCheck, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { Table, Column } from '../../components/common/Table';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.organization && u.organization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User Profile',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={item.name}
            className="w-9 h-9 rounded-full border border-slate-200 object-cover"
          />
          <div>
            <div className="font-bold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-500 font-mono">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => (
        <Badge
          variant={item.role === 'admin' ? 'purple' : item.role === 'officer' ? 'blue' : 'neutral'}
          size="sm"
        >
          {item.role.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'organization',
      header: 'Organization / Dept',
      render: (item) => (
        <span className="text-xs text-slate-700">{item.organization || 'Independent Trader'}</span>
      ),
    },
    {
      key: 'designation',
      header: 'Designation / Badge',
      render: (item) => (
        <span className="text-xs text-slate-600">
          {item.designation || item.badgeNumber || 'Authorized Signatory'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => alert(`Edit user: ${item.name}`)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Manage System Users &amp; Stakeholders
        </h1>
        <p className="text-xs text-slate-500">
          Role-based permissions for Applicants, Legal Metrology Officers, and Administrators
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, email, or company..."
          className="w-full sm:w-80"
        />

        <FilterDropdown
          label="Role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: 'ALL', label: 'All Roles' },
            { value: 'applicant', label: 'Applicants (Owners)' },
            { value: 'officer', label: 'Verification Officers (LMI)' },
            { value: 'admin', label: 'Administrators (Controllers)' },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-2 sm:p-5">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No users found matching criteria."
        />
      </div>
    </div>
  );
};
