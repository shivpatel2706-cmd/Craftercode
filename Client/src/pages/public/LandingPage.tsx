import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  QrCode, 
  Clock, 
  Building2, 
  Smartphone, 
  FileSpreadsheet, 
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const LandingPage: React.FC = () => {
  const workflowSteps = [
    {
      num: '01',
      title: 'Register Instrument',
      desc: 'Owner enrolls instrument specifications, serial numbers, capacity, and accuracy class into the central portal.',
    },
    {
      num: '02',
      title: 'Apply Online',
      desc: 'Submit statutory verification or re-verification application with required documentation and statutory fees.',
    },
    {
      num: '03',
      title: 'Officer Assignment',
      desc: 'Controller assigns designated Legal Metrology Inspector (LMI) based on territorial jurisdiction.',
    },
    {
      num: '04',
      title: 'Field Inspection',
      desc: 'Officer conducts on-site physical inspection, seal verification, and accuracy tests using traceable standard weights.',
    },
    {
      num: '05',
      title: 'Digital Approval',
      desc: 'Supervisory authority reviews NAWI test results, error calculations within MPE, and grants digital approval.',
    },
    {
      num: '06',
      title: 'NAWI Report Generation',
      desc: 'Standardized Non-Automatic Weighing Instrument metrological report formulated with full test data points.',
    },
    {
      num: '07',
      title: 'QR Certificate',
      desc: 'Tamper-evident Certificate of Verification issued with cryptographic hash and scannable public QR verification.',
    },
    {
      num: '08',
      title: 'Renewal Reminder',
      desc: 'Automated SMS and portal alerts dispatched 30 and 15 days prior to statutory verification expiry.',
    },
  ];

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-blue-700" />,
      title: 'Online Application & Fees',
      desc: 'Eliminate paperwork and physical queues. Apply for initial verification or periodic re-verification 24/7.',
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-700" />,
      title: 'Digital Scheduling',
      desc: 'Automated roster allocation and transparent inspection dates with live status tracking from desk audit to seal stamp.',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-700" />,
      title: 'Mobile / Field Inspection',
      desc: 'Mobile-first inspection suite for field inspectors to log zero error, eccentricity, repeatability, and photo evidence on-site.',
    },
    {
      icon: <QrCode className="w-6 h-6 text-purple-700" />,
      title: 'QR Certificate Verification',
      desc: 'Instant verification by consumers, traders, and enforcement squads by scanning the physical seal certificate QR.',
    },
    {
      icon: <Scale className="w-6 h-6 text-amber-700" />,
      title: 'Digital Instrument Passport',
      desc: 'Comprehensive lifecycle audit history of every scale, weighbridge, and fuel dispenser across its operational lifetime.',
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-rose-700" />,
      title: 'Smart Renewal Alerts',
      desc: 'Automated statutory reminder notifications prevent non-compliance penalties under the Legal Metrology Act 2009.',
    },
    {
      icon: <Building2 className="w-6 h-6 text-cyan-700" />,
      title: 'Centralized Dashboard',
      desc: 'Command-and-control oversight for Controllers and State Administrations to monitor verification compliance rates.',
    },
    {
      icon: <Award className="w-6 h-6 text-teal-700" />,
      title: 'OIML & Legal Compliance',
      desc: 'Fully aligned with OIML R76, R117, and Schedule VII of the Legal Metrology (General) Rules, 2011.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-900 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-200 mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Statutory Compliance • Department of Legal Metrology</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif leading-tight">
            Digital Verification for Weighing &amp; Measuring Instruments
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            METROVERIFY 360 makes instrument verification faster, transparent, paperless, 
            and accessible for businesses, field inspectors, and enforcement authorities.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/applicant/register-instrument">
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-base px-6 py-3.5 bg-blue-600 hover:bg-blue-500 font-semibold shadow-lg shadow-blue-900/50">
                Apply for Verification
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/verify">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-6 py-3.5 bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700 font-semibold backdrop-blur-sm">
                <QrCode className="w-4 h-4 mr-2 text-emerald-400" />
                Verify Certificate
              </Button>
            </Link>
          </div>

          {/* Quick Stat Pill Bar */}
          <div className="mt-14 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Paperless Workflow</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">&lt; 72 Hrs</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Verification Turnaround</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">OIML R76</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Metrological Standard</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">QR Sealed</div>
              <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Anti-Tamper Integrity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            End-to-End Metrological Pipeline
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            How METROVERIFY 360 Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            A seamless statutory lifecycle from initial registration to on-site testing and digital seal generation.
          </p>
        </div>

        {/* 8-Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.num}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300 relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-blue-700/80 group-hover:text-blue-700 transition-colors">
                  {step.num}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">
              Key Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Engineered for Statutory Accuracy &amp; Transparency
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Empowering instrument owners, Legal Metrology Officers, and administrators with specialized tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Workspaces Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Dedicated Workspaces for Every Stakeholder
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Switch effortlessly between Applicant, Verification Officer, and Administrator modes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Applicant */}
          <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-500 p-6 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Role 01</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instrument Owner / Applicant</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Register commercial balances, weighbridges, and fuel dispensers. Track 8-stage verification progress live, download QR certificates, and manage renewal alerts.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Self-service instrument registration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Live vertical stepper tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Automated re-verification alerts
                </li>
              </ul>
            </div>
            <Link to="/applicant/dashboard">
              <Button variant="outline" className="w-full text-xs font-semibold">
                Open Applicant Workspace
              </Button>
            </Link>
          </div>

          {/* Card 2: Officer */}
          <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-indigo-500 p-6 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Role 02</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Legal Metrology Officer (LMI)</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Mobile-optimized inspection suite. Log standard weight measurements, zero errors, repeatability, eccentricity corner tests, and upload tamper seal photos.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  On-site mobile inspection forms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  NAWI Class I-IV MPE test limits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Statutory seal number tracking
                </li>
              </ul>
            </div>
            <Link to="/officer/dashboard">
              <Button variant="outline" className="w-full text-xs font-semibold">
                Open Inspector Suite
              </Button>
            </Link>
          </div>

          {/* Card 3: Admin */}
          <div className="bg-white rounded-xl border-2 border-slate-200 hover:border-slate-800 p-6 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Role 03</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Administrator / Controller</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Total regulatory oversight. Assign territorial officers, scrutinize field inspection dossiers, execute digital approvals, issue QR certificates, and monitor audit trails.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-800" />
                  1-Click digital certificate sign-off
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-800" />
                  Officer &amp; jurisdiction management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-800" />
                  Full statutory audit log trail
                </li>
              </ul>
            </div>
            <Link to="/admin/dashboard">
              <Button variant="outline" className="w-full text-xs font-semibold">
                Open Admin Control
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="bg-blue-800 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            Verify Instrument Legality in Seconds
          </h2>
          <p className="mt-3 text-sm sm:text-base text-blue-100">
            Have a verification certificate number or QR code on a weighing balance or fuel dispenser? 
            Check its validity and statutory authority immediately.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/verify">
              <Button size="lg" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-8">
                Verify Any Certificate
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-blue-300 text-white hover:bg-blue-700/50 font-semibold px-8">
                Explore Demo Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
