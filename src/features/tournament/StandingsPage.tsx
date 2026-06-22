import { useEffect, useMemo, useRef, useState } from 'react';
import { TeamProfile } from '../../components/TeamProfile';
import { demoMatches, demoTeams } from '../../data/demoTournament';
import { withFlag } from '../../data/teamFlags';
import {
  GROUP_LETTERS,
  rankAllThirdPlaces,
  rankGroup,
  type DecidedBy,
  type FinalGroupMatch,
  type GroupLetter,
  type Match,
  type MatchStatus,
  type RankedTeam,
  type Stage,
  type Team,
} from '../../domain/worldCupEngine';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type TeamRow = {
  id: string;
  name: string;
  short_name: string;
  fifa_code: string;
  group_letter: GroupLetter;
  draw_position: number;
  fifa_ranking_order: number;
  team_conduct_score: number;
};

type MatchRow = {
  id: string;
  fifa_match_number: number;
  stage: Stage;
  group_letter: GroupLetter | null;
  kickoff_at: string;
  venue: string;
  status: MatchStatus;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  penalties_home: number | null;
  penalties_away: number | null;
  winner_team_id: string | null;
  decided_by: DecidedBy | null;
};

function toTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    fifaCode: row.fifa_code,
    groupLetter: row.group_letter,
    drawPosition: row.draw_position,
    fifaRankingOrder: row.fifa_ranking_order,
    teamConductScore: row.team_conduct_score,
  };
}

function toMatch(row: MatchRow): Match {
  return {
    id: row.id,
    fifaMatchNumber: row.fifa_match_number,
    stage: row.stage,
    groupLetter: row.group_letter,
    kickoffAt: row.kickoff_at,
    venue: row.venue,
    status: row.status,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
    penaltiesHome: row.penalties_home,
    penaltiesAway: row.penalties_away,
    winnerTeamId: row.winner_team_id,
    decidedBy: row.decided_by,
  };
}

function isFinalGroupMatch(match: Match): match is FinalGroupMatch {
  return (
    match.stage === 'GROUP' &&
    match.status === 'FINAL' &&
    match.groupLetter !== null &&
    match.homeTeamId !== null &&
    match.awayTeamId !== null &&
    match.homeScore !== null &&
    match.awayScore !== null
  );
}

function buildGroupTables(teams: Team[], matches: Match[]): Partial<Record<GroupLetter, RankedTeam[]>> {
  const finalGroupMatches = matches.filter(isFinalGroupMatch);

  return Object.fromEntries(
    GROUP_LETTERS.map((groupLetter) => {
      const groupTeams = teams.filter((team) => team.groupLetter === groupLetter);
      const groupMatches = finalGroupMatches.filter((match) => match.groupLetter === groupLetter);
      return [groupLetter, rankGroup(groupTeams, groupMatches)];
    }),
  ) as Partial<Record<GroupLetter, RankedTeam[]>>;
}

function GroupTable({
  title,
  rows,
  onTeamClick,
}: {
  title: string;
  rows: RankedTeam[];
  onTeamClick: (teamId: string) => void;
}) {
  return (
    <section className="table-card">
      <h2>{title}</h2>
      <div className="standings-table">
        <div className="standings-row standings-row--head">
          <span>Equipo</span>
          <span>PJ</span>
          <span>DG</span>
          <span>Pts</span>
        </div>
        {rows.map((row) => (
          <div className="standings-row" key={row.team.id}>
            <button className="team-link standings-team-link" type="button" onClick={() => onTeamClick(row.team.id)}>
              {row.rank}. {withFlag(row.team.id, row.team.name)}
            </button>
            <span>{row.played}</span>
            <span>{row.goalDifference}</span>
            <span>{row.points}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StandingsPage() {
  const [teams, setTeams] = useState<Team[]>(isSupabaseConfigured ? [] : demoTeams);
  const [matches, setMatches] = useState<Match[]>(isSupabaseConfigured ? [] : demoMatches);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [message, setMessage] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const teamProfileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    async function loadStandings() {
      setIsLoading(true);
      setMessage('');

      const [{ data: teamRows, error: teamError }, { data: matchRows, error: matchError }] = await Promise.all([
        supabase!
          .from('teams')
          .select('id, name, short_name, fifa_code, group_letter, draw_position, fifa_ranking_order, team_conduct_score')
          .order('group_letter', { ascending: true })
          .order('draw_position', { ascending: true }),
        supabase!
          .from('matches')
          .select(
            'id, fifa_match_number, stage, group_letter, kickoff_at, venue, status, home_team_id, away_team_id, home_score, away_score, penalties_home, penalties_away, winner_team_id, decided_by',
          )
          .order('fifa_match_number', { ascending: true }),
      ]);

      if (!isMounted) return;

      if (teamError || matchError) {
        setMessage(`No pude cargar la clasificación: ${teamError?.message ?? matchError?.message}`);
      } else {
        setTeams(((teamRows ?? []) as TeamRow[]).map(toTeam));
        setMatches(((matchRows ?? []) as MatchRow[]).map(toMatch));
      }

      setIsLoading(false);
    }

    void loadStandings();

    return () => {
      isMounted = false;
    };
  }, []);

  const tables = useMemo(() => buildGroupTables(teams, matches), [teams, matches]);
  const thirds = useMemo(() => {
    const completeTables = Object.fromEntries(
      GROUP_LETTERS.map((groupLetter) => [groupLetter, tables[groupLetter] ?? []]),
    ) as Record<GroupLetter, RankedTeam[]>;

    const hasThirdPlaceForEveryGroup = GROUP_LETTERS.every((groupLetter) => completeTables[groupLetter].length >= 3);
    if (!hasThirdPlaceForEveryGroup) return [];

    return rankAllThirdPlaces(completeTables).slice(0, 8);
  }, [tables]);

  const showTeamProfile = (teamId: string) => {
    setSelectedTeamId(teamId);
    window.requestAnimationFrame(() => {
      teamProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    if (!selectedTeamId) return;
    teamProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedTeamId]);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Clasificación oficial desde resultados admin</p>
          <h1>Grupos y terceros</h1>
        </div>
      </div>

      {isLoading ? <p className="mode-note">Cargando clasificación desde Supabase...</p> : null}
      {message ? <p className="empty-state">{message}</p> : null}

      {selectedTeamId ? (
        <div ref={teamProfileRef}>
          <TeamProfile teamId={selectedTeamId} matches={matches} onClose={() => setSelectedTeamId(null)} />
        </div>
      ) : null}

      <div className="standings-grid">
        {Object.entries(tables).map(([group, rows]) => (
          <GroupTable key={group} title={`Grupo ${group}`} rows={rows} onTeamClick={showTeamProfile} />
        ))}
      </div>

      <section className="table-card">
        <h2>Mejores terceros</h2>
        <div className="standings-table">
          {thirds.map((row, index) => (
            <div className="ranking-row" key={`${row.team.id}-${row.groupLetter}`}>
              <span>{index + 1}</span>
              <button className="team-link standings-team-link" type="button" onClick={() => showTeamProfile(row.team.id)}>
                {withFlag(row.team.id, row.team.name)} · Grupo {row.groupLetter}
              </button>
              <span>{row.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
