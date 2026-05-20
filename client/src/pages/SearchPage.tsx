import type { ReactNode } from 'react';
import { Form, Link, useLoaderData } from 'react-router';
import { EmptySearchState, PageHeader } from '@/components/workspace-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { requireAuthenticatedLoader } from '../session';
import { searchWorkspace } from '@/lib/mock-data';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';
  const scope = url.searchParams.get('scope') ?? 'all';

  return requireAuthenticatedLoader({
    optionalBackend: 'unavailable',
    query,
    results: searchWorkspace(query, scope),
    scope,
  });
}
export const action = undefined;

export default function SearchPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main className="space-y-6">
      <PageHeader
        description="Search defaults to index-aware page discovery and grouped results across wiki pages, raw sources, and log entries."
        eyebrow="Search"
        title="Find Pages, Sources, and Activity"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Search workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <Form
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]"
                method="get"
              >
                <Input
                  defaultValue={loaderData.query}
                  name="q"
                  placeholder="Search the wiki and source library"
                  type="search"
                />
                <select
                  className="h-11 rounded-2xl border border-input bg-card px-4 text-sm"
                  defaultValue={loaderData.scope}
                  name="scope"
                >
                  <option value="all">All records</option>
                  <option value="pages">Pages only</option>
                  <option value="sources">Sources only</option>
                  <option value="logs">Log only</option>
                </select>
              </Form>
            </CardContent>
          </Card>

          {!loaderData.query ? (
            <EmptySearchState />
          ) : (
            <div className="space-y-6">
              <SearchGroup title="Page matches">
                {loaderData.results.pages.map((page) => (
                  <SearchResultCard
                    key={page.slug}
                    href={`/wiki/${page.slug}`}
                    title={page.title}
                    description={page.summaryLine}
                  />
                ))}
              </SearchGroup>
              <SearchGroup title="Source matches">
                {loaderData.results.sources.map((source) => (
                  <SearchResultCard
                    key={source.id}
                    href={`/sources/${source.id}`}
                    title={source.title}
                    description={source.summary}
                  />
                ))}
              </SearchGroup>
              <SearchGroup title="Log entries">
                {loaderData.results.logs.map((entry) => (
                  <SearchResultCard
                    key={entry.id}
                    href={entry.relatedHref}
                    title={entry.title}
                    description={`## [${entry.entryDate}] ${entry.operation} | ${entry.title}`}
                  />
                ))}
              </SearchGroup>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Backend availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Default engine: index.md + metadata search</p>
              <p>Optional qmd backend: {loaderData.optionalBackend}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function SearchGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function SearchResultCard({
  description,
  href,
  title,
}: {
  description: string;
  href: string;
  title: string;
}) {
  return (
    <Link
      className="block rounded-3xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/40"
      to={href}
    >
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
