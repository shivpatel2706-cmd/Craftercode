import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types/application';
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Eye, 
  ArrowRight, 
  AlertCircle, 
  MapPin, 
  Scale, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { DashboardStatCard } from '../../components/common/DashboardStatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Table, Column } from '../../components/common/Table';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfficerData();
  }, []);

  const loadOfficerData = async () => {
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

  // Metrics
  const assignedInspections = applications.filter(a => a.status === 'Assigned' || a.status === 'Inspection Scheduled');
  const todaysInspections = applications.filter(a => a.inspectionScheduledDate === new Date().toISOString().split('T')[0] || a.status === 'Inspection Scheduled');
  const pendingVerification = applications.filter(a => a.status === 'Inspection Completed');
  const completedInspections = applications.filter(a => a.status === 'Approved' || a.status === 'Rejected');

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
      key: 'ownerName',
      header: 'Owner',
      render: (item) => <span className="text-xs text-slate-800">{item.ownerName}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-[180px]" title={item.location}>
          {item.location}
        </span>
      ),
    },
    {
      key: 'inspectionScheduledDate',
      header: 'Scheduled Date',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-800">
          {item.inspectionScheduledDate || 'Pending Date'}
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
      header: 'Action',
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-1.5">
          {item.status === 'Inspection Scheduled' || item.status === 'Assigned' ? (
            <Link to={`/officer/field-inspection?appId=${item.id}`}>
              <Button variant="primary" size="sm" className="text-xs font-bold whitespace-nowrap bg-blue-700 hover:bg-blue-800">
                Start Inspection
              </Button>
            </Link>
          ) : (
            <Link to={`/applicant/tracking?appId=${item.id}`}>
              <Button variant="outline" size="sm" className="text-xs">
                View Dossier
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Officer Welcome Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {user?.name || 'Inspector S. K. Verma'}
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Legal Metrology Inspector
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Badge: <strong className="font-mono text-slate-700">{user?.badgeNumber || 'LMI-DL-2018-044'}</strong> • Zone: {user?.jurisdictionZone || 'Central Zone 2'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/officer/field-inspection">
            <Button variant="primary" size="md" icon={<Smartphone className="w-4 h-4" />}>
              Open Field Inspector App
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardStatCard
          title="Assigned Inspections"
          value={assignedInspections.length}
          icon={<ClipboardList className="w-5 h-5 text-blue-700" />}
          color="blue"
          description="In officer field queue"
          onClick={() => navigate('/officer/assigned-inspections')}
        />
        <DashboardStatCard
          title="Today's Inspections"
          value={todaysInspections.length}
          icon={<Calendar className="w-5 h-5 text-indigo-700" />}
          color="purple"
          description="Rostered for on-site visit"
          onClick={() => navigate('/officer/calendar')}
        />
        <DashboardStatCard
          title="Pending Verification"
          value={pendingVerification.length}
          icon={<Clock className="w-5 h-5 text-amber-700" />}
          color="amber"
          description="Awaiting Supervisory sign-off"
          onClick={() => navigate('/officer/pending-verification')}
        />
        <DashboardStatCard
          title="Completed Inspections"
          value={completedInspections.length}
          icon={<CheckCircle2 className="w-5 h-5 text-mint-600" />}
          color="mint"
          description="Closed & stamped successfully"
          onClick={() => navigate('/officer/completed-inspections')}
        />
      </div>

      {/* Assigned Inspections Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Statutory Inspection Queue</h2>
            <p className="text-xs text-slate-500">
              Assigned verification and stamping schedule under Legal Metrology Rules
            </p>
          </div>
          <Link
            to="/officer/assigned-inspections"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-2 sm:p-5">
          <Table
            columns={columns}
            data={applications}
            keyExtractor={(app) => app.id}
            isLoading={loading}
            emptyMessage="No inspections assigned to this roster."
          />
        </div>
      </div>
    </div>
  );
};
