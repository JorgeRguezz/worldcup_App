import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDisplayNameTakenError, normalizeDisplayName, validateDisplayName } from '../../lib/profile';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

function getAuthRedirectUrl(): string {
  return `${window.location.origin}/auth`;
}

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');

  if (!isSupabaseConfigured) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Configuración pendiente</h1>
          <p className="empty-state">Faltan las variables de Supabase. No se puede iniciar sesión todavía.</p>
        </section>
      </main>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (mode === 'signin') {
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      setMessage(error?.message ?? 'Sesión iniciada');
      if (!error) navigate('/reglas', { replace: true });
    }

    if (mode === 'signup') {
      const normalizedDisplayName = normalizeDisplayName(displayName || email.split('@')[0]);
      const validationMessage = validateDisplayName(normalizedDisplayName);
      if (validationMessage) {
        setMessage(validationMessage);
        return;
      }

      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: normalizedDisplayName },
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });
      setMessage(
        error
          ? isDisplayNameTakenError(error)
            ? 'Ese nombre ya lo está usando otra persona.'
            : error.message
          : 'Cuenta creada. Revisa el correo si tu proyecto exige confirmación.',
      );
      if (!error && data.session) navigate('/reglas', { replace: true });
    }

    if (mode === 'reset') {
      const { error } = await supabase!.auth.resetPasswordForEmail(email, { redirectTo: getAuthRedirectUrl() });
      setMessage(error?.message ?? 'Correo de recuperación enviado.');
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : 'Recuperar contraseña'}</h1>
        {mode === 'signup' ? (
          <label>
            Nombre visible
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </label>
        ) : null}
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        {mode !== 'reset' ? (
          <label>
            Contraseña
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
          </label>
        ) : null}
        <button className="primary-button" type="submit">
          {mode === 'signin' ? 'Iniciar sesión' : mode === 'signup' ? 'Registrarme' : 'Enviar recuperación'}
        </button>
        <div className="auth-switcher">
          <button type="button" onClick={() => setMode('signin')}>
            Entrar
          </button>
          <button type="button" onClick={() => setMode('signup')}>
            Registro
          </button>
          <button type="button" onClick={() => setMode('reset')}>
            Recuperar
          </button>
        </div>
        {message ? <p className="form-message">{message}</p> : null}
      </form>
    </main>
  );
}
