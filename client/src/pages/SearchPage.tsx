import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    optionalBackend: 'unavailable',
    pageMatches: [],
    route: 'Search',
    sourceMatches: [],
  });
}

export const action = createPlaceholderAction('run-search');

export default function SearchPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'run-search', label: 'Intent', name: 'intent' },
        {
          defaultValue: 'knowledge gaps',
          label: 'Query',
          name: 'query',
          type: 'search',
        },
      ]}
      loaderData={loaderData}
      route="/search"
      submitLabel="Submit search action"
      summary="Workspace search scaffold grouped by pages and raw sources with optional qmd availability."
      title="Search"
    />
  );
}
