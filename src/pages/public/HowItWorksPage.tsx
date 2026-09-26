import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck, 
  Clock, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const HowItWorksPage: React.FC = () => {
  const testProtocols = [
    {
      title: 'Zero Load Error Test',
      standard: 'OIML R76 / Legal Metrology General Rules (Clause 4.1)',
      desc: 'The instrument is balanced at zero load. The zero indication must not drift beyond +/- 0.25 e (verification scale interval) under stable thermal conditions.'
    },
    {
      title: 'Eccentricity (Corner Load) Test',
      standard: 'OIML R76 (Clause 3.6.2)',
      desc: 'A test load of 1/3 of maximum capacity is placed sequentially at four quarter locations on the load receiver to ensure corner error does not exceed the Maximum Permissible Error (MPE).'
    },
    {
      title: 'Repeatability Test',
      standard: 'OIML R76 (Clause 3.6.1)',
      desc: 'Repeated measurements (typically 3 to 10 iterations) of identical test loads (around 50% and 100% capacity) are executed to verify that the delta between readings remains within 1 e.'
    },
    {
      title: 'Maximum Permissible Error (MPE) Test',
      standard: 'Legal Metrology Act 2009 (Schedule VII)',
      desc: 'Stepwise loading and unloading using certified Class E2, F1, or M1 standard weights traceable to the National Physical Laboratory (NPL).'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Statutory Metrology Guide
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            How Instrument Verification Works
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Under Section 24 of The Legal Metrology Act, 2009, all weights and measures used in commercial transactions, 
            industrial logistics, health, and consumer retail must be verified and stamped prior to initial use and periodically renewed.
          </p>
        </div>

        {/* Metrological Test Protocols */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-700" />
            Standard NAWI Verification Protocols (Non-Automatic Weighing Instruments)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testProtocols.map((p, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
                  {p.standard}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{p.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Classification Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Accuracy Classes &amp; Verification Frequency
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-slate-700">
                <tr>
                  <th className="p-3">Class</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Typical Application</th>
                  <th className="p-3">Statutory Periodicity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-bold text-blue-800">Class I</td>
                  <td className="p-3">Special Accuracy</td>
                  <td className="p-3">Analytical Lab balances, Micro-balances</td>
                  <td className="p-3 font-semibold">Every 12 Months</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-blue-800">Class II</td>
                  <td className="p-3">High Accuracy</td>
                  <td className="p-3">Gold, Diamonds, Pharmaceutical formulations</td>
                  <td className="p-3 font-semibold">Every 12 Months</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-blue-800">Class III</td>
                  <td className="p-3">Medium Accuracy</td>
                  <td className="p-3">Weighbridges, Platform Scales, Retail POS</td>
                  <td className="p-3 font-semibold">Every 12 / 24 Months</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-blue-800">Class IV</td>
                  <td className="p-3">Ordinary Accuracy</td>
                  <td className="p-3">Bulk agricultural measures, Scrap scales</td>
                  <td className="p-3 font-semibold">Every 12 Months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action button */}
        <div className="text-center">
          <Link to="/applicant/register-instrument">
            <Button size="lg" variant="primary" className="font-bold px-8">
              Proceed to Register Instrument
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
