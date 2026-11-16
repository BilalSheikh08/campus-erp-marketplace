import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronUp, UserCheck, Shield, Store, Building, GraduationCap } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const DEMO_ROLES = [
  {
    role: 'Student',
    name: 'Aarav Sharma',
    email: 'student@campus.edu',
    icon: GraduationCap,
    route: '/marketplace',
    desc: 'Browse food, buy books, lodge hostel requests',
  },
  {
    role: 'Canteen Vendor',
    name: 'Chef Vikram',
    email: 'canteen@campus.edu',
    icon: Store,
    route: '/vendor/dashboard',
    desc: 'Manage live orders, food menu & scan pickup QR',
  },
  {
    role: 'Hostel Warden',
    name: 'Dr. R. K. Gupta',
    email: 'warden@campus.edu',
    icon: Building,
    route: '/warden/dashboard',
    desc: 'Review & approve student hostel room requests',
  },
  {
    role: 'Campus Admin',
    name: 'SuperAdmin',
    email: 'admin@campus.edu',
    icon: Shield,
    route: '/admin/dashboard',
    desc: 'Vendor approvals, campus analytics & system controls',
  },
];

export default function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('demo') || urlParams.has('dev') || localStorage.getItem('campus_demo_switcher') === 'true';
  });

  const { user, login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible((prev) => {
          const next = !prev;
          localStorage.setItem('campus_demo_switcher', next ? 'true' : 'false');
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleSwitch = async (item) => {
    setSwitching(true);
    try {
      await login(item.email, 'password123');
      setOpen(false);
      navigate(item.route);
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {open ? (
        <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/80 p-4 w-76 sm:w-88 text-white backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-xs text-white">Demo Role Switcher</h4>
              <p className="text-[10px] text-slate-400">Press Ctrl+Shift+D to hide</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close role switcher"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {DEMO_ROLES.map((r) => {
              const Icon = r.icon;
              const isCurrent = user?.email === r.email;
              return (
                <button
                  key={r.email}
                  type="button"
                  disabled={switching}
                  onClick={() => handleSwitch(r)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-600/15 text-white ring-1 ring-blue-500/30'
                      : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{r.role}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800 flex items-center gap-1">
                          <UserCheck className="h-2.5 w-2.5" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{r.name} • {r.email}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              Campus ERP • Development Sandbox
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-slate-200 hover:text-white rounded-full shadow-lg transition-all text-xs font-semibold border border-slate-700 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Switch Demo Role</span>
          <ChevronUp className="h-3 w-3 opacity-70" />
        </button>
      )}
    </div>
  );
}
