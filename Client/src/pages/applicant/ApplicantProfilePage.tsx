import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Building, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ApplicantProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Applicant Profile &amp; Enterprise Data
        </h1>
        <p className="text-xs text-slate-500">
          Statutory registration information registered with the Legal Metrology Directorate
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={user?.name}
            className="w-16 h-16 rounded-full border-2 border-blue-600 object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs font-semibold text-blue-700">{user?.organization}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.designation}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5 font-semibold">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Verified Email
            </span>
            <span className="font-bold text-slate-800 font-mono">{user?.email}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5 font-semibold">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              Primary Contact Number
            </span>
            <span className="font-bold text-slate-800 font-mono">{user?.phone}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Registered Commercial Premises
            </span>
            <span className="font-semibold text-slate-800">{user?.address}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Account Type: <strong className="text-slate-800 capitalize">{user?.role}</strong></span>
          <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            KYC Verified
          </span>
        </div>
      </div>
    </div>
  );
};
