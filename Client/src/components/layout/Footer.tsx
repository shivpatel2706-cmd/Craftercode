import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Shield, CheckCircle, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand block — wider */}
          <div className="md:col-span-5 space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-900/40">
                <Scale className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                METROVERIFY <span className="text-blue-400">360</span>
              </span>
            </div>

            <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
              National statutory verification, calibration management and digital
              certification platform for weighing and measuring instruments under
              the Legal Metrology Act, 2009.
            </p>

            {/* Compliance chips */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-xl">
                <Shield className="w-3.5 h-3.5 text-mint-400" strokeWidth={1.8} />
                Tamper-Evident QR Records
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-xl">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.8} />
                OIML R76 / R117 Compliant
              </span>
            </div>
          </div>

          {/* Portal Services */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-4">
              Portal Services
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/verify',        label: 'Public Certificate Verification' },
                { to: '/login',         label: 'Applicant Registration' },
                { to: '/how-it-works',  label: 'Inspection Workflow' },
                { to: '/contact',       label: 'Reference Standards Labs' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-200 transition-all duration-150"
                  >
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Statutory Guidelines */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest mb-4">
              Statutory Guidelines
            </h4>
            <ul className="space-y-3">
              {[
                'Legal Metrology Act, 2009 (1 of 2010)',
                'General Rules, 2011 (Schedule VII)',
                'Approval of Models Rules, 2011',
                'Packaged Commodities Rules',
              ].map((text) => (
                <li key={text} className="flex items-start gap-2 text-sm text-neutral-500">
                  <span className="w-1 h-1 rounded-full bg-neutral-600 mt-2 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600 text-center sm:text-left">
            © {new Date().getFullYear()} METROVERIFY 360 · Directorate of Legal Metrology.
            <span className="text-amber-600/80 ml-1.5">Smart India Hackathon Prototype.</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-600">
            {['Privacy Policy', 'Terms of Verification', 'Helpdesk'].map((item, i, arr) => (
              <React.Fragment key={item}>
                <button className="hover:text-neutral-300 transition-base">{item}</button>
                {i < arr.length - 1 && <span className="text-neutral-800">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
