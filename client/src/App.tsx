import {
  NavLink,
  Outlet,
  isRouteErrorResponse,
  useLocation,
  useRouteError,
} from 'react-router';
import {
  BookMarked,
  FileSearch,
  ScrollText,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from './lib/auth-context';

const authenticatedLinks = [
  { label: 'Dashboard', to: '/', icon: Sparkles },
  { label: 'Raw Sources', to: '/sources', icon: FileSearch },
  { label: 'Batch Ingest', to: '/ingest/batch', icon: ScrollText },
  { label: 'Wiki Index', to: '/wiki', icon: BookMarked },
  { label: 'Graph View', to: '/wiki/graph', icon: Sparkles },
  { label: 'Query Workspace', to: '/queries', icon: ScrollText },
  { label: 'Lint', to: '/lint', icon: Sparkles },
  { label: 'Log', to: '/log', icon: ScrollText },
  { label: 'Schema', to: '/schema', icon: BookMarked },
  { label: 'Search', to: '/search', icon: FileSearch },
  { label: 'Settings', to: '/settings', icon: Settings2 },
];

export default function App() {
  const { loading, logout, user } = useAuth();
  const location = useLocation();
  const isAuthRoute =
    location.pathname === '/login' || location.pathname === '/register';

  if (loading) {
    return (
      <main className="page-shell min-h-screen py-12">
        <Card className="mx-auto max-w-xl">
          <CardContent className="space-y-3 p-10 text-center">
            <p className="muted-label">LLM Wiki</p>
            <h1 className="inked-title text-4xl">Loading workspace session</h1>
            <p className="text-muted-foreground">
              Refreshing access, citations, and inspector state.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isAuthRoute && !user) {
    return <Outlet />;
  }

  return (
    <div className="page-shell min-h-screen py-4">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="paper-panel sticky top-4 h-fit overflow-hidden bg-sidebar text-sidebar-foreground">
          <div className="border-b border-border/80 p-6">
            <p className="muted-label">Private Knowledge Base</p>
            <h1 className="inked-title mt-3 text-4xl">LLM Wiki</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Scholar&apos;s workshop for raw sources, persistent pages, and
              graph-native review.
            </p>
          </div>
          <nav aria-label="Primary" className="space-y-1 p-4">
            {authenticatedLinks.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-card text-foreground shadow-[0_10px_30px_rgba(31,26,23,0.08)]'
                      : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
                  ].join(' ')
                }
                end={link.to === '/'}
                to={link.to}
              >
                <link.icon className="size-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="border-t border-border/80 p-4">
              <div className="rounded-3xl bg-card p-4">
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => void logout()}
                  variant="outline"
                >
                  Sign out
                </Button>
              </div>
            </div>
          ) : null}
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function RootErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <main className="page-shell min-h-screen py-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="space-y-4 p-10">
            <p className="muted-label">LLM Wiki</p>
            <h1 className="inked-title text-4xl">
              {error.status} {error.statusText}
            </h1>
            <p className="text-muted-foreground">
              {error.data
                ? String(error.data)
                : 'The application could not complete that request.'}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="page-shell min-h-screen py-12">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-4 p-10">
          <p className="muted-label">LLM Wiki</p>
          <h1 className="inked-title text-4xl">Something went wrong</h1>
          <p className="text-muted-foreground">Please try again.</p>
        </CardContent>
      </Card>
    </main>
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <main className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-10">
            <p className="muted-label">Route Error</p>
            <h1 className="inked-title text-4xl">
              {error.status} {error.statusText}
            </h1>
            <p className="text-muted-foreground">
              {error.data
                ? String(error.data)
                : 'This route could not be loaded.'}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main>
      <Card>
        <CardContent className="space-y-4 p-10">
          <p className="muted-label">Route Error</p>
          <h1 className="inked-title text-4xl">Something went wrong</h1>
          <p className="text-muted-foreground">
            This route failed unexpectedly.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
