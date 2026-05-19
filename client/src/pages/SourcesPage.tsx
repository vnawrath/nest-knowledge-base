import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    filters: ['article', 'paper', 'image', 'transcript'],
    route: 'Raw Sources',
    sources: [],
    uploadLimitMb: 100,
  });
}

export const action = createPlaceholderAction('upload-source');

export default function SourcesPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'upload-source', label: 'Intent', name: 'intent' },
        { defaultValue: 'article', label: 'Source type', name: 'sourceType' },
      ]}
      loaderData={loaderData}
      route="/sources"
      submitLabel="Submit source action"
      summary="Paginated raw source library scaffold with placeholder filter and upload actions."
      title="Raw Sources"
    />
  );
}
