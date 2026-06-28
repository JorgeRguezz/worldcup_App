import { KeyRound, Mail, Save, Trophy, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamName } from '../../data/demoTournament';
import { isDisplayNameTakenError, normalizeDisplayName, validateDisplayName } from '../../lib/profile';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { SpecialPredictionRow } from '../../lib/specialPredictions';

type ProfileRow = {
  display_name: string;
};

type RankingRow = {
  match_points: number;
  special_points: number;
  superquota_points: number;
  total_points: number;
};

export function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [ranking, setRanking] = useState<RankingRow | null>(null);
  const [specialPrediction, setSpecialPrediction] = useState<SpecialPredictionRow | null>(null);
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

      const [profileResult, rankingResult, specialPredictionResult] = await Promise.all([
        supabase!.from('profiles').select('display_name').eq('id', userResult.user.id).single(),
        supabase!
          .from('ranking')
          .select('match_points, special_points, superquota_points, total_points')
          .eq('user_id', userResult.user.id)
          .maybeSingle(),
        supabase!
          .from('special_predictions')
          .select(
            'user_id, champion_team_id, best_player_name, top_scorer_player_name, top_assist_player_name, champion_points_awarded, best_player_points_awarded, top_scorer_points_awarded, top_assist_points_awarded, points_awarded, updated_at',
          )
          .eq('user_id', userResult.user.id)
          .maybeSingle(),
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

      if (!specialPredictionResult.error) {
        setSpecialPrediction((specialPredictionResult.data as SpecialPredictionRow | null) ?? null);
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
        <article className="profile-card profile-card--wide">
          <div className="profile-card__heading">
            <Trophy size={20} />
            <div>
              <h2>Desglose de puntos</h2>
            </div>
          </div>
          <div className="profile-points-breakdown">
            <span>Partidos <strong>{ranking?.match_points ?? 0}</strong></span>
            <span>Predicción especial <strong>{ranking?.special_points ?? 0}</strong></span>
            <span>Supercuotas <strong>{ranking?.superquota_points ?? 0}</strong></span>
          </div>
        </article>

        <article className="profile-card profile-card--wide">
          <div className="profile-card__heading">
            <Trophy size={20} />
            <div>
              <h2>Predicción especial</h2>
              <p>Campeón, mejor jugador, máximo goleador y máximo asistente.</p>
            </div>
          </div>
          {specialPrediction ? (
            <div className="special-selection-list special-selection-list--profile">
              <span>
                Campeón <b>{teamName(specialPrediction.champion_team_id)}</b>
                <small>+{specialPrediction.champion_points_awarded} pts</small>
              </span>
              <span>
                Mejor jugador <b>{specialPrediction.best_player_name}</b>
                <small>+{specialPrediction.best_player_points_awarded} pts</small>
              </span>
              <span>
                Máximo goleador <b>{specialPrediction.top_scorer_player_name}</b>
                <small>+{specialPrediction.top_scorer_points_awarded} pts</small>
              </span>
              <span>
                Máximo asistente <b>{specialPrediction.top_assist_player_name}</b>
                <small>+{specialPrediction.top_assist_points_awarded} pts</small>
              </span>
              <strong>Total especial: +{specialPrediction.points_awarded} pts</strong>
            </div>
          ) : (
            <p className="empty-state">Todavía no has guardado tu predicción especial.</p>
          )}
        </article>

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
