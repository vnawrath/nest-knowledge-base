import { Form, useLoaderData } from 'react-router';
import { LogEntryCard, PageHeader } from '@/components/workspace-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLogSnapshot } from '@/lib/mock-data';
import { requireAuthenticatedLoader } from '../session';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const operation = url.searchParams.get('operation') ?? 'all';

  return requireAuthenticatedLoader({
    entries: getLogSnapshot(operation),
    operation,
  });
}
export const action = undefined;

export default function LogPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main className="space-y-6">
      <PageHeader
        description="Chronological, append-only activity with the exact heading format preserved so unix tooling still works."
        eyebrow="Log"
        title="Parsed log.md"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {loaderData.entries.map((entry) => (
            <LogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Operation filter</CardTitle>
            </CardHeader>
            <CardContent>
              <Form className="space-y-3" method="get">
                <select
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm"
                  defaultValue={loaderData.operation}
                  name="operation"
                >
                  <option value="all">All operations</option>
                  <option value="ingest">Ingest</option>
                  <option value="query">Query</option>
                  <option value="lint">Lint</option>
                  <option value="review">Review</option>
                </select>
              </Form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Why this matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Every heading stays parseable:{' '}
                <code>## [YYYY-MM-DD] operation | Title</code>.
              </p>
              <p>
                This makes quick shell inspection and git review practical even
                outside the UI.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
