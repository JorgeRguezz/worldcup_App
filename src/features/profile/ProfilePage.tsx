import { KeyRound, Mail, Save, Trophy, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isDisplayNameTakenError, normalizeDisplayName, validateDisplayName } from '../../lib/profile';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type ProfileRow = {
  display_name: string;
};

type RankingRow = {
  match_points: number;
  special_points: number;
  total_points: number;
};

export function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [ranking, setRanking] = useState<RankingRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [pageMessage, setPageMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setPageMessage('');

      const { data: userResult, error: userError } = await supabase!.auth.getUser();
      if (!isMounted) return;

      if (userError || !userResult.user) {
        setPageMessage('Necesitas iniciar sesión para ver tu perfil.');
        setIsLoading(false);
        return;
      }

      setUserId(userResult.user.id);
      setEmail(userResult.user.email ?? '');

      const [profileResult, rankingResult] = await Promise.all([
        supabase!.from('profiles').select('display_name').eq('id', userResult.user.id).single(),
        supabase!.from('ranking').select('match_points, special_points, total_points').eq('user_id', userResult.user.id).maybeSingle(),
      ]);

      if (!isMounted) return;

      if (profileResult.error) {
        setPageMessage(`No pude cargar tu perfil: ${profileResult.error.message}`);
      } else {
        const profile = profileResult.data as ProfileRow;
        setDisplayName(profile.display_name);
        setNameDraft(profile.display_name);
      }

      if (!rankingResult.error) {
        setRanking((rankingResult.data as RankingRow | null) ?? null);
      }

      setIsLoading(false);
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveDisplayName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameMessage('');

    if (!supabase || !userId) return;

    const nextDisplayName = normalizeDisplayName(nameDraft);
    const validationMessage = validateDisplayName(nextDisplayName);
    if (validationMessage) {
      setNameMessage(validationMessage);
      return;
    }

    if (nextDisplayName === displayName) {
      setNameMessage('Ese nombre ya está guardado.');
      return;
    }

    setIsSavingName(true);
    const { error } = await supabase.from('profiles').update({ display_name: nextDisplayName }).eq('id', userId);
    setIsSavingName(false);

    if (error) {
      setNameMessage(isDisplayNameTakenError(error) ? 'Ese nombre ya lo está usando otra persona.' : `No pude guardar el nombre: ${error.message}`);
      return;
    }

    setDisplayName(nextDisplayName);
    setNameDraft(nextDisplayName);
    setNameMessage('Nombre actualizado.');
  };

  const savePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage('');

    if (!supabase) return;

    if (newPassword.length < 6) {
      setPasswordMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== repeatPassword) {
      setPasswordMessage('Las dos contraseñas no coinciden.');
      return;
    }

    setIsSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsSavingPassword(false);

    if (error) {
      setPasswordMessage(`No pude cambiar la contraseña: ${error.message}`);
      return;
    }

    setNewPassword('');
    setRepeatPassword('');
    setPasswordMessage('Contraseña actualizada.');
  };

  if (!isSupabaseConfigured) {
    return (
      <section className="page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Cuenta</p>
            <h1>Perfil</h1>
          </div>
        </div>
        <section className="table-card">
          <p className="empty-state">Configura Supabase para editar perfiles.</p>
        </section>
      </section>
    );
  }

  return (
    <section className="page profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Cuenta</p>
          <h1>Perfil</h1>
        </div>
        <Link className="primary-link" to="/">
          Volver a Inicio
        </Link>
      </div>

      {pageMessage ? <p className="form-message">{pageMessage}</p> : null}
      {isLoading ? <p className="empty-state">Cargando perfil...</p> : null}

      <section className="profile-summary">
        <article className="metric">
          <UserRound size={22} />
          <span>Nombre visible</span>
          <strong>{displayName || '-'}</strong>
        </article>
        <article className="metric">
          <Trophy size={22} />
          <span>Puntos totales</span>
          <strong>{ranking?.total_points ?? 0}</strong>
        </article>
        <article className="metric">
          <Mail size={22} />
          <span>Email</span>
          <strong>{email || '-'}</strong>
        </article>
      </section>

      <div className="profile-grid">
        <form className="profile-card" onSubmit={saveDisplayName}>
          <div className="profile-card__heading">
            <UserRound size={20} />
            <div>
              <h2>Nombre en la app</h2>
              <p>Este es el nombre que verá el resto en ranking y apuestas.</p>
            </div>
          </div>
          <label>
            Nombre visible
            <input value={nameDraft} maxLength={24} onChange={(event) => setNameDraft(event.target.value)} required />
          </label>
          <button className="primary-button" type="submit" disabled={isSavingName}>
            <Save size={16} />
            {isSavingName ? 'Guardando...' : 'Guardar nombre'}
          </button>
          {nameMessage ? <p className="form-message">{nameMessage}</p> : null}
        </form>

        <form className="profile-card" onSubmit={savePassword}>
          <div className="profile-card__heading">
            <KeyRound size={20} />
            <div>
              <h2>Seguridad</h2>
              <p>Cambia la contraseña de acceso a tu cuenta.</p>
            </div>
          </div>
          <label>
            Nueva contraseña
            <input type="password" value={newPassword} minLength={6} onChange={(event) => setNewPassword(event.target.value)} required />
          </label>
          <label>
            Repetir contraseña
            <input type="password" value={repeatPassword} minLength={6} onChange={(event) => setRepeatPassword(event.target.value)} required />
          </label>
          <button className="primary-button" type="submit" disabled={isSavingPassword}>
            <KeyRound size={16} />
            {isSavingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
          {passwordMessage ? <p className="form-message">{passwordMessage}</p> : null}
        </form>
      </div>
    </section>
  );
}
