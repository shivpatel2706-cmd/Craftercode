import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Scale, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { UserRole } from '../../types/user';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAs } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('applicant@metroverify.gov.in');
  const [password, setPassword] = useState('••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      success('Logged in successfully', 'Authentication Verified');
      // Redirect based on role
      const lower = email.toLowerCase();
      if (lower.includes('admin')) navigate('/admin/dashboard');
      else if (lower.includes('officer')) navigate('/officer/dashboard');
      else navigate('/applicant/dashboard');
    } catch (err: any) {
      error(err?.message || 'Login failed. Please verify credentials.', 'Authentication Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      await loginAs(role);
      success(`Switched active session to ${role.toUpperCase()}`, 'Prototype Quick Switch');
      if (role === 'applicant') navigate('/applicant/dashboard');
      else if (role === 'officer') navigate('/officer/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      error('Demo login switch error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              METROVERIFY <span className="text-blue-700">360</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Directorate of Legal Metrology
            </span>
          </div>
        </Link>
        <h3 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900">
          Sign in to your statutory portal
        </h3>
        <p className="mt-1 text-center text-xs text-slate-600">
          Statutory weighing and measuring instruments certification platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email / Username"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@metroverify.gov.in"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your statutory portal password"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>

              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert('In this prototype, please select any of the Demo Login roles below.');
                }}
                className="font-semibold text-blue-700 hover:text-blue-800"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md shadow-blue-700/20 mt-2"
              isLoading={isLoading}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Prototype Demo Switcher Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="relative flex justify-center text-xs uppercase mb-4">
              <span className="bg-white px-3 text-slate-500 font-bold tracking-wider">
                Hackathon Demo Quick Logins
              </span>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('applicant')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 transition-all text-xs text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <div className="font-bold">Login as Applicant</div>
                    <div className="text-[10px] text-blue-700">Rajesh Sharma (Apex Agro &amp; Logistics)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('officer')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-900 transition-all text-xs text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    O
                  </div>
                  <div>
                    <div className="font-bold">Login as Verification Officer</div>
                    <div className="text-[10px] text-indigo-700">Inspector S. K. Verma (LMI Zone 2)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200/80 text-slate-900 transition-all text-xs text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                    C
                  </div>
                  <div>
                    <div className="font-bold">Login as Administrator</div>
                    <div className="text-[10px] text-slate-600">Dr. A. Ramanathan (Controller &amp; Chief Inspector)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-800 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Public QR check footer note */}
        <div className="text-center mt-6">
          <Link
            to="/verify"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Need to verify a certificate without logging in? Click here</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
