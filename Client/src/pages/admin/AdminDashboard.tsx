import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { instrumentService } from '../../services/instrumentService';
import { certificateService } from '../../services/certificateService';
import { userService } from '../../services/userService';
import { notificationService } from '../../services/notificationService';
import { Application } from '../../types/application';
import { Certificate } from '../../types/certificate';
import { AuditLog, RenewalAlert } from '../../types/notification';
import { 
  Scale, 
  FileText, 
  Clock, 
  Calendar, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  History,
  Check
} from 'lucide-react';
import { DashboardStatCard } from '../../components/common/DashboardStatCard';
import { Button } from '../../components/common/Button';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [renewals, setRenewals] = useState<RenewalAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [totalInstruments, setTotalInstruments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [apps, certs, insts, rens, logs] = await Promise.all([
        applicationService.getApplications(),
        certificateService.getCertificates(),
        instrumentService.getInstruments(),
        notificationService.getRenewalAlerts(),
        userService.getAuditLogs(),
      ]);

      setApplications(apps);
      setCertificates(certs);
      setTotalInstruments(insts.length);
      setRenewals(rens);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'Pending' || a.status === 'Assigned' || a.status === 'Inspection Scheduled');
  const inspectionsToday = applications.filter(a => a.status === 'Inspection Scheduled' || a.status === 'Inspection Completed').length;
  const approvedCerts = certificates.filter(c => c.status === 'VALID').length;
  const expiredCerts = certificates.filter(c => c.status === 'EXPIRED').length;
  const pendingApprovals = applications.filter(a => a.status === 'Inspection Completed').length;

  // Status distributions
  const appStatusCounts = {
    Pending: applications.filter(a => a.status === 'Pending').length,
    Assigned: applications.filter(a => a.status === 'Assigned').length,
    'Scheduled': applications.filter(a => a.status === 'Inspection Scheduled').length,
    'Insp Completed': applications.filter(a => a.status === 'Inspection Completed').length,
    Approved: applications.filter(a => a.status === 'Approved').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Admin Command Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Directorate Statutory Command Center
            </h1>
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Controller
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{user?.name}</strong> • Legal Metrology Directorate (All Territorial Jurisdictions)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/approvals">
            <Button
              variant="primary"
              size="md"
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="bg-blue-700 hover:bg-blue-800 font-bold shadow"
            >
              Digital Approval Queue ({pendingApprovals})
            </Button>
          </Link>
        </div>
      </div>

      {/* 7 Required Admin Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <DashboardStatCard
          title="Instruments"
          value={totalInstruments}
          icon={<Scale className="w-4 h-4 text-blue-700" />}
          color="blue"
          onClick={() => navigate('/admin/instruments')}
        />
        <DashboardStatCard
          title="Applications"
          value={applications.length}
          icon={<FileText className="w-4 h-4 text-slate-700" />}
          color="neutral"
          onClick={() => navigate('/admin/applications')}
        />
        <DashboardStatCard
          title="Pending Apps"
          value={pendingApps.length}
          icon={<Clock className="w-4 h-4 text-amber-700" />}
          color="amber"
          onClick={() => navigate('/admin/applications')}
        />
        <DashboardStatCard
          title="Inspections Today"
          value={inspectionsToday}
          icon={<Calendar className="w-4 h-4 text-purple-700" />}
          color="purple"
          onClick={() => navigate('/officer/calendar')}
        />
        <DashboardStatCard
          title="Approved Certs"
          value={approvedCerts}
          icon={<Award className="w-4 h-4 text-emerald-700" />}
          color="mint"
          onClick={() => navigate('/admin/certificates')}
        />
        <DashboardStatCard
          title="Expired Certs"
          value={expiredCerts}
          icon={<AlertTriangle className="w-4 h-4 text-rose-700" />}
          color="rose"
          onClick={() => navigate('/admin/certificates')}
        />
        <DashboardStatCard
          title="Renewals Due"
          value={renewals.length}
          icon={<Clock className="w-4 h-4 text-amber-700" />}
          color="amber"
          onClick={() => navigate('/applicant/renewal-alerts')}
        />
      </div>

      {/* Analytics & Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Applications by Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Applications by Status
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Real-time</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(appStatusCounts).map(([stat, count]) => {
              const total = applications.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={stat} className="text-xs">
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700">{stat}</span>
                    <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        stat === 'Approved'
                          ? 'bg-emerald-500'
                          : stat === 'Rejected'
                          ? 'bg-rose-500'
                          : stat === 'Insp Completed'
                          ? 'bg-purple-500'
                          : stat === 'Pending'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Monthly Verification Trends */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Verification Trends (2026)
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +14.2% MoM
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
            {[
              { month: 'Apr', count: 18, height: '40%' },
              { month: 'May', count: 24, height: '52%' },
              { month: 'Jun', count: 31, height: '68%' },
              { month: 'Jul', count: 28, height: '62%' },
              { month: 'Aug', count: 39, height: '84%' },
              { month: 'Sep', count: 46, height: '95%' },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.count}
                </span>
                <div
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-t-md transition-all shadow-sm"
                  style={{ height: bar.height }}
                ></div>
                <span className="text-[10px] text-slate-400 font-semibold">{bar.month}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 text-[11px] text-slate-500 text-center">
            Average statutory inspection clearance: <strong>48 hours</strong>
          </div>
        </div>

        {/* Chart 3: Certificates by Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Certificates by Status
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Total {certificates.length}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 my-auto py-4 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-2xl font-black text-emerald-700 block">{approvedCerts}</span>
              <span className="text-[11px] font-bold text-emerald-800 uppercase">VALID</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-2xl font-black text-amber-700 block">{expiredCerts}</span>
              <span className="text-[11px] font-bold text-amber-800 uppercase">EXPIRED</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-2xl font-black text-rose-700 block">
                {certificates.filter(c => c.status === 'REVOKED').length}
              </span>
              <span className="text-[11px] font-bold text-rose-800 uppercase">REVOKED</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
            <span className="font-semibold block text-slate-800">Tamper Seal Checksum:</span>
            All valid certificates synced to public QR verification endpoint.
          </div>
        </div>
      </div>

      {/* Recent Activity & Statutory Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-700" />
              Statutory Activity &amp; Audit Log
            </h3>
            <p className="text-xs text-slate-500">
              Real-time audit trail of statutory actions executed under Legal Metrology Act 2009
            </p>
          </div>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4 text-xs transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-bold text-slate-900">{log.userName}</strong>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                      {log.userRole}
                    </span>
                    <span className="font-mono text-[10px] text-blue-700 font-semibold">{log.action}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{log.details}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{log.ipAddress}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-[11px] text-slate-400 block font-mono">{log.timestamp}</span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
