import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AdminPage } from '../features/admin/AdminPage';
import { AuthPage } from '../features/auth/AuthPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PredictionsPage } from '../features/predictions/PredictionsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { RankingPage } from '../features/ranking/RankingPage';
import { RankingUserPage } from '../features/ranking/RankingUserPage';
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
      { path: 'ranking/usuario/:userId', element: <RankingUserPage /> },
      { path: 'reglas', element: <RulesPage /> },
      { path: 'perfil', element: <ProfilePage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);
