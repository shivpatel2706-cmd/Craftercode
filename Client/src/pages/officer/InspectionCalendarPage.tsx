import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../types/application';
import { Calendar as CalendarIcon, Clock, MapPin, Scale, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const InspectionCalendarPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentMonth, setCurrentMonth] = useState('September 2026');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const apps = await applicationService.getApplications();
    setApplications(apps);
  };

  const scheduled = applications.filter(a => a.inspectionScheduledDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Inspection Field Calendar
          </h1>
          <p className="text-xs text-slate-500">
            Scheduled on-site verification dates, field lorry visits, and client appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<ChevronLeft className="w-4 h-4" />}>
            Prev
          </Button>
          <span className="text-xs font-bold text-slate-800 px-3 py-1 bg-white border border-slate-200 rounded-lg">
            {currentMonth}
          </span>
          <Button variant="outline" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Schedule Cards */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Scheduled Visits ({scheduled.length})
          </h2>

          {scheduled.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 flex flex-col items-center justify-center flex-shrink-0 w-16">
                  <span className="text-xs font-bold uppercase">SEP</span>
                  <span className="text-xl font-black">{app.inspectionScheduledDate?.split('-')[2] || '24'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-800">{app.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      app.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {app.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{app.instrumentName}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{app.ownerName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-1">{app.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                  {app.capacity}
                </span>
                <Link to={`/officer/field-inspection?appId=${app.id}`}>
                  <Button variant="primary" size="sm" icon={<Smartphone className="w-3.5 h-3.5" />} className="text-xs font-bold">
                    Start Test
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Right Info Box */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Standard Test Weights Allocated
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Heavy Weighbridge Test Lorry</span>
                <strong className="text-slate-800">20,000 kg M1</strong>
              </li>
              <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Analytical Standard Weights Box</span>
                <strong className="text-slate-800">Class E2 (1mg - 500g)</strong>
              </li>
              <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Conical Fuel Prover Measures</span>
                <strong className="text-slate-800">5L &amp; 10L Class 0.2</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Verification Lead Seals Issued</span>
                <strong className="text-emerald-700">150 Seals Active</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
