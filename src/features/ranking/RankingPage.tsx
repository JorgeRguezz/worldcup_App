import { useEffect, useMemo, useState } from 'react';
import { demoRanking } from '../../data/demoTournament';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type RankingRow = {
  user_id?: string;
  display_name: string;
  match_points: number;
  special_points: number;
  total_points: number;
};

type RankedViewRow = {
  key: string;
  position: number;
  name: string;
  matchPoints: number;
  specialPoints: number;
  totalPoints: number;
};

function rankRows(rows: RankingRow[]): RankedViewRow[] {
  let previousPoints: number | null = null;
  let previousPosition = 0;

  return [...rows]
    .sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return a.display_name.localeCompare(b.display_name);
    })
    .map((row, index) => {
      const position = previousPoints === row.total_points ? previousPosition : index + 1;
      previousPoints = row.total_points;
      previousPosition = position;

      return {
        key: row.user_id ?? row.display_name,
        position,
        name: row.display_name,
        matchPoints: row.match_points,
        specialPoints: row.special_points,
        totalPoints: row.total_points,
      };
    });
}

export function RankingPage() {
  const [rows, setRows] = useState<RankingRow[]>(
    demoRanking.map((row) => ({
      display_name: row.name,
      match_points: row.matchPoints,
      special_points: row.specialPoints,
      total_points: row.totalPoints,
    })),
  );
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadRanking() {
      setIsLoading(true);
      setMessage('');

      const { data, error } = await supabase!
        .from('ranking')
        .select('user_id, display_name, match_points, special_points, total_points')
        .order('total_points', { ascending: false })
        .order('display_name', { ascending: true });

      if (!isMounted) return;

      if (error) {
        setMessage(`No pude cargar el ranking: ${error.message}`);
        setRows([]);
      } else {
        setRows((data ?? []) as RankingRow[]);
      }

      setIsLoading(false);
    }

    void loadRanking();

    return () => {
      isMounted = false;
    };
  }, []);

  const rankedRows = useMemo(() => rankRows(rows), [rows]);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Puntos de partidos + especiales</p>
          <h1>Ranking global</h1>
        </div>
      </div>

      {message ? <p className="form-message">{message}</p> : null}
      {isLoading ? <p className="empty-state">Cargando ranking...</p> : null}

      <section className="table-card ranking-table">
        <div className="ranking-row ranking-row--head">
          <span>Pos.</span>
          <span>Nombre</span>
          <span>Partidos</span>
          <span>Especiales</span>
          <span>Total</span>
        </div>
        {rankedRows.length > 0 ? (
          rankedRows.map((row) => (
            <div className="ranking-row" key={row.key}>
              <span>{row.position}</span>
              <strong>{row.name}</strong>
              <span>{row.matchPoints}</span>
              <span>{row.specialPoints}</span>
              <span>{row.totalPoints}</span>
            </div>
          ))
        ) : (
          <p className="empty-state">Todavía no hay usuarios registrados en el ranking.</p>
        )}
      </section>
    </section>
  );
}
