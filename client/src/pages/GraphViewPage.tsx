import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    hubPages: [],
    orphanPages: [],
    route: 'Graph View',
    totalLinks: 0,
  });
}

export const action = createPlaceholderAction('highlight-contradictions');

export default function GraphViewPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        {
          defaultValue: 'highlight-contradictions',
          label: 'Intent',
          name: 'intent',
        },
        { defaultValue: 'concept', label: 'Category filter', name: 'category' },
      ]}
      loaderData={loaderData}
      route="/wiki/graph"
      submitLabel="Submit graph action"
      summary="Page-link graph scaffold with placeholder graph filters and orphan-page highlights."
      title="Graph View"
    />
  );
}
