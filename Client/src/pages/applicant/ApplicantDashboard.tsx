import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { instrumentService } from '../../services/instrumentService';
import { certificateService } from '../../services/certificateService';
import { notificationService } from '../../services/notificationService';
import { Application } from '../../types/application';
import { 
  Scale, 
  Clock, 
  Award, 
  AlertTriangle, 
  PlusCircle, 
  ArrowRight, 
  Eye, 
  FileText,
  ShieldCheck,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { DashboardStatCard } from '../../components/common/DashboardStatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Table, Column } from '../../components/common/Table';

export const ApplicantDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [totalInstruments, setTotalInstruments] = useState(0);
  const [approvedCertsCount, setApprovedCertsCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [apps, insts, certs, renewals] = await Promise.all([
        applicationService.getApplications(),
        instrumentService.getInstruments(),
        certificateService.getCertificates(),
        notificationService.getRenewalAlerts(),
      ]);

      setApplications(apps);
      setTotalInstruments(insts.length);
      setApprovedCertsCount(certs.filter(c => c.status === 'VALID').length);
      setExpiringSoonCount(renewals.filter(r => r.status === 'Expiring Soon' || r.status === 'Due Immediately').length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pendingAppsCount = applications.filter(a => a.status === 'Pending' || a.status === 'Assigned' || a.status === 'Inspection Scheduled').length;

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
          <div className="text-[11px] text-slate-500 font-mono">{item.serialNumber} • {item.capacity}</div>
        </div>
      ),
    },
    {
      key: 'applicationDate',
      header: 'Application Date',
      render: (item) => <span className="text-xs">{item.applicationDate}</span>,
    },
    {
      key: 'inspectionScheduledDate',
      header: 'Inspection Date',
      render: (item) => (
        <span className="text-xs">
          {item.inspectionScheduledDate ? (
            <span className="inline-flex items-center gap-1 font-medium text-slate-800">
              <Calendar className="w-3 h-3 text-blue-600" />
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
      header: 'Officer',
      render: (item) => (
        <span className="text-xs">
          {item.officerName ? (
            <span className="font-medium text-slate-800">{item.officerName}</span>
          ) : (
            <span className="text-slate-400 italic">Pending Assignment</span>
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
        <div className="flex justify-end gap-1.5">
          <Link to={`/applicant/tracking?appId=${item.id}`}>
            <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
              Track
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {user?.name || 'Applicant'}
            </h1>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Owner Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {user?.organization} • Central Legal Metrology Verification System
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/applicant/register-instrument">
            <Button variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
              Register New Instrument
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardStatCard
          title="Total Instruments"
          value={totalInstruments}
          icon={<Scale className="w-5 h-5 text-blue-700" />}
          color="blue"
          description="Enrolled in statutory registry"
          onClick={() => navigate('/applicant/instruments')}
        />
        <DashboardStatCard
          title="Pending Applications"
          value={pendingAppsCount}
          icon={<Clock className="w-5 h-5 text-amber-700" />}
          color="amber"
          description="In review or inspection queue"
          onClick={() => navigate('/applicant/applications')}
        />
        <DashboardStatCard
          title="Approved Certificates"
          value={approvedCertsCount}
          icon={<Award className="w-5 h-5 text-mint-600" />}
          color="mint"
          description="Active & verified instruments"
          onClick={() => navigate('/applicant/certificates')}
        />
        <DashboardStatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          icon={<AlertTriangle className="w-5 h-5 text-rose-700" />}
          color="rose"
          description="Re-verification due < 30 days"
          onClick={() => navigate('/applicant/renewal-alerts')}
        />
      </div>

      {/* Recent Applications Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Verification Applications</h2>
            <p className="text-xs text-slate-500">
              Track real-time statutory inspection and certificate status
            </p>
          </div>
          <Link
            to="/applicant/applications"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-2 sm:p-5">
          <Table
            columns={columns}
            data={applications.slice(0, 5)}
            keyExtractor={(app) => app.id}
            isLoading={loading}
            emptyMessage="No verification applications filed yet."
          />
        </div>
      </div>
    </div>
  );
};
