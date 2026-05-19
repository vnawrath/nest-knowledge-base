import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  assertPlaceholderRecord,
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader({ params }: { params: { sourceId?: string } }) {
  const sourceId = assertPlaceholderRecord(params.sourceId, 'Source');
  return requireAuthenticatedLoader({
    contradictions: [],
    impactedPages: [],
    route: 'Ingest Review',
    sourceId,
    suggestedTakeaways: ['Key takeaway placeholder'],
  });
}

export const action = createPlaceholderAction('run-ingest');

export default function IngestReviewPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'run-ingest', label: 'Intent', name: 'intent' },
        {
          defaultValue: 'Approve summary draft',
          label: 'Decision',
          name: 'decision',
        },
      ]}
      loaderData={loaderData}
      route="/sources/:sourceId/ingest"
      submitLabel="Submit ingest review action"
      summary="Review source takeaways, draft summary markdown, and affected wiki pages."
      title="Ingest Review"
    />
  );
}
