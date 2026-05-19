import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    queueState: 'idle',
    route: 'Batch Ingest',
    selectedSources: [],
    workspaceSchema: 'AGENTS.md',
  });
}

export const action = createPlaceholderAction('enqueue-batch');

export default function BatchIngestPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'enqueue-batch', label: 'Intent', name: 'intent' },
        {
          defaultValue: 'source-1,source-2',
          label: 'Source IDs',
          name: 'sourceIds',
        },
      ]}
      loaderData={loaderData}
      route="/ingest/batch"
      submitLabel="Submit batch ingest action"
      summary="Batch ingest queue scaffold with placeholder controls for ordering and job start."
      title="Batch Ingest"
    />
  );
}
