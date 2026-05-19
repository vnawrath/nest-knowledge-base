import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  assertPlaceholderRecord,
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader({ params }: { params: { queryId?: string } }) {
  const queryId = assertPlaceholderRecord(params.queryId, 'Query');
  return requireAuthenticatedLoader({
    citedPages: [],
    queryId,
    renderedAnswer: 'Saved query answer placeholder',
    route: 'Saved Query Detail',
  });
}

export const action = createPlaceholderAction('rerun-query');

export default function QueryDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'rerun-query', label: 'Intent', name: 'intent' },
        { defaultValue: 'markdown', label: 'Format', name: 'format' },
      ]}
      loaderData={loaderData}
      route="/queries/:queryId"
      submitLabel="Submit saved query action"
      summary="Saved query detail scaffold with citations, rendered output, and version actions."
      title="Saved Query Detail"
    />
  );
}
