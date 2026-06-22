import { ChevronDown, LogOut, Menu, Shield, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

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

type AuthStatus = 'checking' | 'authenticated' | 'anonymous' | 'local';

export function AppLayout() {
  const [canSeeAdmin, setCanSeeAdmin] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'checking' : 'local');
  const mobileNavMenuRef = useRef<HTMLDetailsElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setCanSeeAdmin(false);
      setAuthStatus('local');
      return;
    }

    let isMounted = true;

    async function loadUserState() {
      setAuthStatus('checking');

      const { data: userResult } = await supabase!.auth.getUser();
      if (!isMounted) return;

      if (!userResult.user) {
        setCanSeeAdmin(false);
        setAuthStatus('anonymous');
        return;
      }

      setAuthStatus('authenticated');

      const { data: profile } = await supabase!.from('profiles').select('is_admin').eq('id', userResult.user.id).single();
      if (!isMounted) return;

      setCanSeeAdmin(Boolean((profile as ProfileRow | null)?.is_admin));
    }

    void loadUserState();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(() => {
      void loadUserState();
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    setCanSeeAdmin(false);
    setAuthStatus(isSupabaseConfigured ? 'anonymous' : 'local');
  };

  const visibleNavItems = [...navItems, ...(canSeeAdmin ? [{ to: '/admin', label: 'Admin' }] : [])];
  const activeNavItem =
    visibleNavItems.find((item) => (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to))) ?? visibleNavItems[0];
  const closeMobileNavMenu = () => {
    if (mobileNavMenuRef.current) {
      mobileNavMenuRef.current.open = false;
    }
  };

  if (import.meta.env.PROD && !isSupabaseConfigured) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Configuración pendiente</h1>
          <p className="empty-state">Faltan las variables de Supabase en el despliegue. La porra privada no está disponible todavía.</p>
        </section>
      </main>
    );
  }

  const mustSignIn = isSupabaseConfigured && authStatus === 'anonymous';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${canSeeAdmin ? 'sidebar--admin' : 'sidebar--user'}`}>
        <NavLink to="/" className="brand">
          <Trophy size={28} />
          <span>Porra Mundial 2026</span>
        </NavLink>
        <details ref={mobileNavMenuRef} className="mobile-nav-menu">
          <summary className="mobile-nav-toggle">
            <span className="mobile-nav-toggle__label">
              <Menu size={16} />
              {activeNavItem.label}
            </span>
            <ChevronDown className="mobile-nav-toggle__chevron" size={16} />
          </summary>
          <nav className="mobile-nav-list" aria-label="Secciones">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
                onClick={closeMobileNavMenu}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </details>
        <nav className="nav-list nav-list--desktop">
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          {canSeeAdmin ? (
            <div className="mode-note">
              <Shield size={16} />
              {isSupabaseConfigured ? 'Supabase conectado' : 'Datos FIFA locales'}
            </div>
          ) : null}
          <button className="ghost-button" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main-content">
        {authStatus === 'checking' ? (
          <p className="empty-state">Comprobando sesión...</p>
        ) : mustSignIn ? (
          <Navigate to="/auth" replace state={{ from: location.pathname }} />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
