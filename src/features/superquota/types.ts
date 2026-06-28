export const SUPERQUOTA_MARKET_TYPES = [
  'YES_NO',
  'TEAM',
  'PLAYER',
  'NUMBER_RANGE',
  'MULTIPLE_CHOICE',
] as const;

export type SuperquotaMarketType = (typeof SUPERQUOTA_MARKET_TYPES)[number];
export type SuperquotaMarketStatus = 'DRAFT' | 'PUBLISHED' | 'RESOLVED' | 'CANCELLED';

export type Player = {
  id: string;
  teamId: string;
  name: string;
  position: string | null;
  shirtNumber: number | null;
  isActive: boolean;
};

export type SuperquotaMarket = {
  id: string;
  matchId: string;
  marketType: SuperquotaMarketType;
  title: string;
  defaultPoints: number;
  subjectTeamId: string | null;
  subjectPlayerId: string | null;
  status: SuperquotaMarketStatus;
  correctOptionId: string | null;
  publishedAt: string | null;
  resolvedAt: string | null;
  cancelledAt: string | null;
};

export type SuperquotaOption = {
  id: string;
  marketId: string;
  label: string;
  points: number | null;
  teamId: string | null;
  playerId: string | null;
  displayOrder: number;
};

export type SuperquotaPrediction = {
  id: string;
  userId: string;
  marketId: string;
  optionId: string;
  pointsAwarded: number;
  isVoid: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VisibleSuperquotaPrediction = {
  matchId: string;
  marketId: string;
  marketTitle: string;
  userId: string;
  displayName: string;
  optionId: string;
  optionLabel: string;
  pointsAwarded: number;
  isVoid: boolean;
  updatedAt: string;
};
