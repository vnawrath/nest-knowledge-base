import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    categories: ['entity', 'concept', 'source'],
    latestChanges: [],
    renderedIndex: '# index.md',
    route: 'Wiki Index',
  });
}

export const action = createPlaceholderAction('filter-category');

export default function WikiIndexPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'filter-category', label: 'Intent', name: 'intent' },
        { defaultValue: 'entity', label: 'Category', name: 'category' },
      ]}
      loaderData={loaderData}
      route="/wiki"
      submitLabel="Submit wiki index action"
      summary="Rendered index.md scaffold with grouped catalog data and manual page-shell actions."
      title="Wiki Index"
    />
  );
}
