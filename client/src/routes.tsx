import { Navigate, Outlet } from 'react-router';
import type { RouteObject } from 'react-router';
import App, { RootErrorBoundary, RouteErrorBoundary } from './App';
import { useAuth } from './lib/auth-context';
import BatchIngestPage, {
  action as batchIngestAction,
  loader as batchIngestLoader,
} from './pages/BatchIngestPage';
import DashboardPage, {
  action as dashboardAction,
  loader as dashboardLoader,
} from './pages/DashboardPage';
import GraphViewPage, {
  action as graphViewAction,
  loader as graphViewLoader,
} from './pages/GraphViewPage';
import IngestReviewPage, {
  action as ingestReviewAction,
  loader as ingestReviewLoader,
} from './pages/IngestReviewPage';
import LintPage, {
  action as lintAction,
  loader as lintLoader,
} from './pages/LintPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LogPage, {
  action as logAction,
  loader as logLoader,
} from './pages/LogPage';
import QueriesPage, {
  action as queriesAction,
  loader as queriesLoader,
} from './pages/QueriesPage';
import QueryDetailPage, {
  action as queryDetailAction,
  loader as queryDetailLoader,
} from './pages/QueryDetailPage';
import SchemaPage, {
  action as schemaAction,
  loader as schemaLoader,
} from './pages/SchemaPage';
import SearchPage, {
  action as searchAction,
  loader as searchLoader,
} from './pages/SearchPage';
import SettingsPage, {
  action as settingsAction,
  loader as settingsLoader,
} from './pages/SettingsPage';
import SourceDetailPage, {
  action as sourceDetailAction,
  loader as sourceDetailLoader,
} from './pages/SourceDetailPage';
import SourcesPage, {
  action as sourcesAction,
  loader as sourcesLoader,
} from './pages/SourcesPage';
import WikiIndexPage, {
  action as wikiIndexAction,
  loader as wikiIndexLoader,
} from './pages/WikiIndexPage';
import WikiPageDetail, {
  action as wikiPageAction,
  loader as wikiPageLoader,
} from './pages/WikiPageDetail';

function AuthenticatedOutlet() {
  const { loading, user } = useAuth();

  if (loading) {
    return <main>Loading session...</main>;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}

function LoginRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <main>Loading session...</main>;
  }

  if (user) {
    return <Navigate replace to="/" />;
  }

  return <LoginPage />;
}

function RegisterRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <main>Loading session...</main>;
  }

  if (user) {
    return <Navigate replace to="/" />;
  }

  return <RegisterPage />;
}

export const routes: RouteObject[] = [
  {
    id: 'root',
    path: '/',
    Component: App,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        path: 'login',
        Component: LoginRoute,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'register',
        Component: RegisterRoute,
        errorElement: <RouteErrorBoundary />,
      },
      {
        Component: AuthenticatedOutlet,
        children: [
          {
            index: true,
            loader: dashboardLoader,
            action: dashboardAction,
            Component: DashboardPage,
          },
          {
            path: 'sources',
            loader: sourcesLoader,
            action: sourcesAction,
            Component: SourcesPage,
          },
          {
            path: 'sources/:sourceId',
            loader: sourceDetailLoader,
            action: sourceDetailAction,
            Component: SourceDetailPage,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: 'sources/:sourceId/ingest',
            loader: ingestReviewLoader,
            action: ingestReviewAction,
            Component: IngestReviewPage,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: 'ingest/batch',
            loader: batchIngestLoader,
            action: batchIngestAction,
            Component: BatchIngestPage,
          },
          {
            path: 'wiki',
            loader: wikiIndexLoader,
            action: wikiIndexAction,
            Component: WikiIndexPage,
          },
          {
            path: 'wiki/graph',
            loader: graphViewLoader,
            action: graphViewAction,
            Component: GraphViewPage,
          },
          {
            path: 'wiki/:slug',
            loader: wikiPageLoader,
            action: wikiPageAction,
            Component: WikiPageDetail,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: 'queries',
            loader: queriesLoader,
            action: queriesAction,
            Component: QueriesPage,
          },
          {
            path: 'queries/:queryId',
            loader: queryDetailLoader,
            action: queryDetailAction,
            Component: QueryDetailPage,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: 'lint',
            loader: lintLoader,
            action: lintAction,
            Component: LintPage,
          },
          {
            path: 'log',
            loader: logLoader,
            action: logAction,
            Component: LogPage,
          },
          {
            path: 'schema',
            loader: schemaLoader,
            action: schemaAction,
            Component: SchemaPage,
          },
          {
            path: 'search',
            loader: searchLoader,
            action: searchAction,
            Component: SearchPage,
          },
          {
            path: 'settings',
            loader: settingsLoader,
            action: settingsAction,
            Component: SettingsPage,
          },
          {
            path: '*',
            loader: () => {
              throw new Response('Not Found', {
                status: 404,
                statusText: 'Not Found',
              });
            },
            errorElement: <RouteErrorBoundary />,
          },
        ],
      },
    ],
  },
];
