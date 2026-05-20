import { Form, useActionData, useLoaderData } from 'react-router';
import {
  ActionBanner,
  PageHeader,
  SourceCard,
} from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';
import { getBatchIngestSnapshot } from '@/lib/mock-data';

export async function loader() {
  return requireAuthenticatedLoader(getBatchIngestSnapshot());
}

export const action = createPlaceholderAction('enqueue-batch');

export default function BatchIngestPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionMessage = actionData
    ? `Batch action ${actionData.intent} stored with ${actionData.fields.sourceIds ?? 'current'} sources.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        description="Queue many sources at once while keeping the schema rules and page impact visible before the batch starts."
        eyebrow="Batch Ingest"
        title="Backlog Queue"
      />
      <ActionBanner message={actionMessage} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {loaderData.selectedSources.map((source, index) => (
            <div key={source.id} className="space-y-3">
              <p className="muted-label">Queue position {index + 1}</p>
              <SourceCard source={source} />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Schema guardrails</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {loaderData.schemaRules.map((rule) => (
                  <li
                    key={rule}
                    className="rounded-2xl bg-secondary/45 px-4 py-3"
                  >
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Batch controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Queue state: {loaderData.queueState}
              </p>
              <Form className="space-y-3" method="post">
                <input name="intent" type="hidden" value="enqueue-batch" />
                <input
                  name="sourceIds"
                  type="hidden"
                  value={loaderData.selectedSources
                    .map((source) => source.id)
                    .join(',')}
                />
                <Button className="w-full" type="submit">
                  Enqueue selected sources
                </Button>
              </Form>
              <Form className="space-y-3" method="post">
                <input name="intent" type="hidden" value="cancel-batch" />
                <input
                  name="sourceIds"
                  type="hidden"
                  value={loaderData.selectedSources
                    .map((source) => source.id)
                    .join(',')}
                />
                <Button className="w-full" type="submit" variant="outline">
                  Cancel batch
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
