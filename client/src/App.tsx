import {
  Form,
  NavLink,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from 'react-router';
import { rootLoader } from './session';

const authenticatedLinks = [
  { label: 'Dashboard', to: '/' },
  { label: 'Raw Sources', to: '/sources' },
  { label: 'Batch Ingest', to: '/ingest/batch' },
  { label: 'Wiki Index', to: '/wiki' },
  { label: 'Graph View', to: '/wiki/graph' },
  { label: 'Query Workspace', to: '/queries' },
  { label: 'Lint', to: '/lint' },
  { label: 'Log', to: '/log' },
  { label: 'Schema', to: '/schema' },
  { label: 'Search', to: '/search' },
  { label: 'Settings', to: '/settings' },
];

export default function App() {
  const { session } = useLoaderData<typeof rootLoader>();

  return (
    <div>
      <header>
        <p>LLM Wiki</p>
        <p>
          Persistent knowledge workspace scaffolded with NestJS, Vite, and React
          Router.
        </p>
        {session.authenticated ? (
          <div>
            <p>Signed in as {session.email}</p>
            <Form action="/login" method="post">
              <input name="intent" type="hidden" value="sign-out" />
              <button type="submit">Sign out</button>
            </Form>
          </div>
        ) : null}
      </header>
      {session.authenticated ? (
        <nav aria-label="Primary">
          {authenticatedLinks.map((link) => (
            <div key={link.to}>
              <NavLink to={link.to}>{link.label}</NavLink>
            </div>
          ))}
        </nav>
      ) : null}
      <Outlet />
    </div>
  );
}

export function RootErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <main>
        <h1>LLM Wiki</h1>
        <h2>
          {error.status} {error.statusText}
        </h2>
        <p>
          {error.data
            ? String(error.data)
            : 'The application could not complete that request.'}
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>LLM Wiki</h1>
      <h2>Something went wrong</h2>
      <p>Please try again.</p>
    </main>
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <main>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>
          {error.data ? String(error.data) : 'This route could not be loaded.'}
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Something went wrong</h1>
      <p>This route failed unexpectedly.</p>
    </main>
  );
}
