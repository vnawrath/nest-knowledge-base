import { Form, useLoaderData } from 'react-router';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader, SourceCard } from '@/components/workspace-ui';
import { listSources, mockWorkspace } from '@/lib/mock-data';
import { requireAuthenticatedLoader } from '../session';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const status = url.searchParams.get('status') ?? 'all';
  const type = url.searchParams.get('type') ?? 'all';

  return requireAuthenticatedLoader({
    filters: { q, status, type },
    sources: listSources({ q, status, type }),
    uploadLimitMb: 100,
    warehouseCounts: {
      ingested: mockWorkspace.rawSources.filter(
        (source) => source.status === 'ingested',
      ).length,
      queued: mockWorkspace.rawSources.filter(
        (source) => source.status === 'queued',
      ).length,
      reviewed: mockWorkspace.rawSources.filter(
        (source) => source.status === 'reviewed',
      ).length,
    },
  });
}
export const action = undefined;

export default function SourcesPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main className="space-y-6">
      <PageHeader
        description="Browse immutable raw material before it becomes wiki structure. Filters live in the URL so review states stay shareable."
        eyebrow="Raw Sources"
        title="Source Library"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Filter source desk</CardTitle>
            </CardHeader>
            <CardContent>
              <Form
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]"
                method="get"
              >
                <Input
                  defaultValue={loaderData.filters.q}
                  name="q"
                  placeholder="Search title, summary, or notes"
                  type="search"
                />
                <select
                  className="h-11 rounded-2xl border border-input bg-card px-4 text-sm"
                  defaultValue={loaderData.filters.type}
                  name="type"
                >
                  <option value="all">All types</option>
                  <option value="article">Article</option>
                  <option value="paper">Paper</option>
                  <option value="slack-thread">Slack thread</option>
                  <option value="meeting-transcript">Meeting transcript</option>
                </select>
                <select
                  className="h-11 rounded-2xl border border-input bg-card px-4 text-sm"
                  defaultValue={loaderData.filters.status}
                  name="status"
                >
                  <option value="all">All statuses</option>
                  <option value="queued">Queued</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="ingested">Ingested</option>
                </select>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {loaderData.sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Library counts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3">
                <span>Queued</span>
                <span>{loaderData.warehouseCounts.queued}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3">
                <span>Reviewed</span>
                <span>{loaderData.warehouseCounts.reviewed}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3">
                <span>Ingested</span>
                <span>{loaderData.warehouseCounts.ingested}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Recommended ingest path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Use Obsidian Web Clipper when possible so titles, URLs, and
                clean markdown arrive together.
              </p>
              <p>
                For image-aware notes, download attachments into{' '}
                <code>raw/assets/</code> before triggering ingest review.
              </p>
              <p>
                Upload limit for this workspace: {loaderData.uploadLimitMb} MB
                per source.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
