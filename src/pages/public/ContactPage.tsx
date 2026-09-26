import React from 'react';
import { Building2, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Card } from '../../components/common/Card';

export const ContactPage: React.FC = () => {
  const rrslOffices = [
    {
      city: 'New Delhi (HQ)',
      name: 'Directorate of Legal Metrology, HQ',
      address: 'Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001',
      phone: '+91 (011) 2338-9442',
      email: 'dir-legalmetrology@gov.in',
      hours: '09:00 AM - 05:30 PM (Mon - Fri)'
    },
    {
      city: 'Ahmedabad (West Zone)',
      name: 'Regional Reference Standard Laboratory (RRSL)',
      address: 'Near Commerce House, Navrangpura, Ahmedabad, Gujarat - 380009',
      phone: '+91 (079) 2630-1129',
      email: 'rrsl-ahmedabad@nic.in',
      hours: '09:30 AM - 05:30 PM (Mon - Fri)'
    },
    {
      city: 'Bengaluru (South Zone)',
      name: 'Regional Reference Standard Laboratory (RRSL)',
      address: 'PB No. 5814, Rajajinagar Industrial Town, Bengaluru, Karnataka - 560010',
      phone: '+91 (080) 2315-4420',
      email: 'rrsl-bengaluru@nic.in',
      hours: '09:30 AM - 05:30 PM (Mon - Fri)'
    },
    {
      city: 'Faridabad (North Zone)',
      name: 'Regional Reference Standard Laboratory (RRSL)',
      address: 'Sector 20-B, NH-4, Faridabad, Haryana - 121001',
      phone: '+91 (0129) 228-5511',
      email: 'rrsl-faridabad@nic.in',
      hours: '09:00 AM - 05:00 PM (Mon - Fri)'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Inspectorate &amp; RRSL Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            Legal Metrology Contact Directory
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            For statutory verification inquiries, calibration of standard weights, or grievance redressal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rrslOffices.map((office, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                    {office.city}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {office.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{office.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-mono">{office.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="font-mono text-blue-700">{office.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{office.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
