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
    attachmentsPath: 'raw/assets/',
    linkedWikiPages: [],
    route: 'Raw Source Detail',
    sourceId,
  });
}

export const action = createPlaceholderAction('trigger-ingest');

export default function SourceDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'trigger-ingest', label: 'Intent', name: 'intent' },
        {
          defaultValue: 'Reviewed title',
          label: 'Display title',
          name: 'title',
        },
      ]}
      loaderData={loaderData}
      route="/sources/:sourceId"
      submitLabel="Submit source detail action"
      summary="Source metadata, extracted preview, attachments, and linked wiki pages."
      title="Raw Source Detail"
    />
  );
}
