import { LogOut, Shield, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { DEFAULT_RULES_VERSION } from '../features/rules/rulesContent';

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/predicciones', label: 'Predicciones' },
  { to: '/clasificaciones', label: 'Grupos' },
  { to: '/cuadro', label: 'Cuadro' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/reglas', label: 'Reglas' },
];

type ProfileRow = {
  is_admin: boolean;
};

type RulesRow = {
  version: number;
};

type RulesAcknowledgementRow = {
  rules_version: number;
};

type RulesGateStatus = 'checking' | 'open' | 'required';

export function AppLayout() {
  const [canSeeAdmin, setCanSeeAdmin] = useState(false);
  const [rulesGateStatus, setRulesGateStatus] = useState<RulesGateStatus>(isSupabaseConfigured ? 'checking' : 'open');
  const location = useLocation();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setCanSeeAdmin(false);
      setRulesGateStatus('open');
      return;
    }

    let isMounted = true;

    async function loadUserState() {
      setRulesGateStatus('checking');

      const { data: userResult } = await supabase!.auth.getUser();
      if (!isMounted) return;

      if (!userResult.user) {
        setCanSeeAdmin(false);
        setRulesGateStatus('open');
        return;
      }

      const [{ data: profile }, { data: rulesRow, error: rulesError }, { data: ackRow, error: ackError }] = await Promise.all([
        supabase!.from('profiles').select('is_admin').eq('id', userResult.user.id).single(),
        supabase!.from('app_rules').select('version').eq('id', true).maybeSingle(),
        supabase!.from('rule_acknowledgements').select('rules_version').eq('user_id', userResult.user.id).maybeSingle(),
      ]);
      if (!isMounted) return;

      setCanSeeAdmin(Boolean((profile as ProfileRow | null)?.is_admin));
      if (rulesError || ackError) {
        setRulesGateStatus('open');
        return;
      }

      const rulesVersion = (rulesRow as RulesRow | null)?.version ?? DEFAULT_RULES_VERSION;
      const acceptedVersion = (ackRow as RulesAcknowledgementRow | null)?.rules_version ?? 0;
      setRulesGateStatus(acceptedVersion >= rulesVersion ? 'open' : 'required');
    }

    void loadUserState();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(() => {
      void loadUserState();
    });

    window.addEventListener('rules-acknowledged', loadUserState);

    return () => {
      isMounted = false;
      window.removeEventListener('rules-acknowledged', loadUserState);
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setCanSeeAdmin(false);
    setRulesGateStatus('open');
  };

  const mustReadRules = rulesGateStatus === 'required' && location.pathname !== '/reglas';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <Trophy size={28} />
          <span>Mundial App</span>
        </NavLink>
        <nav className="nav-list">
          {[...navItems, ...(canSeeAdmin ? [{ to: '/admin', label: 'Admin' }] : [])].map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="mode-note">
            <Shield size={16} />
            {isSupabaseConfigured ? 'Supabase conectado' : 'Datos FIFA locales'}
          </div>
          <button className="ghost-button" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </aside>
      <main className="main-content">
        {rulesGateStatus === 'checking' ? (
          <p className="empty-state">Comprobando reglas...</p>
        ) : mustReadRules ? (
          <Navigate to="/reglas" replace state={{ from: location.pathname }} />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
