import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AdminPage } from '../features/admin/AdminPage';
import { AuthPage } from '../features/auth/AuthPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PredictionsPage } from '../features/predictions/PredictionsPage';
import { RankingPage } from '../features/ranking/RankingPage';
import { RulesPage } from '../features/rules/RulesPage';
import { BracketPage } from '../features/tournament/BracketPage';
import { StandingsPage } from '../features/tournament/StandingsPage';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'predicciones', element: <PredictionsPage /> },
      { path: 'clasificaciones', element: <StandingsPage /> },
      { path: 'cuadro', element: <BracketPage /> },
      { path: 'ranking', element: <RankingPage /> },
      { path: 'reglas', element: <RulesPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);
