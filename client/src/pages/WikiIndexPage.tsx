import { Form, useLoaderData } from 'react-router';
import {
  MarkdownSheet,
  PageHeader,
  WikiPageCard,
} from '@/components/workspace-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWikiIndexSnapshot } from '@/lib/mock-data';
import { requireAuthenticatedLoader } from '../session';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? 'all';

  return requireAuthenticatedLoader({
    category,
    ...getWikiIndexSnapshot(category),
  });
}
export const action = undefined;

export default function WikiIndexPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main className="space-y-6">
      <PageHeader
        description="Treat index.md as the manuscript table of contents: grouped, annotated, and always close to the underlying page catalog."
        eyebrow="Wiki Index"
        title="index.md and Page Catalog"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <MarkdownSheet
            markdown={loaderData.renderedIndex}
            title="Rendered index.md"
          />
          {Object.entries(loaderData.grouped).map(([category, pages]) => (
            <section key={category} className="space-y-4">
              <h2 className="inked-title text-3xl">{category}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {pages.map((page) => (
                  <WikiPageCard key={page.slug} page={page} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Catalog filters</CardTitle>
            </CardHeader>
            <CardContent>
              <Form className="space-y-3" method="get">
                <select
                  className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm"
                  defaultValue={loaderData.category}
                  name="category"
                >
                  <option value="all">All categories</option>
                  <option value="concept">Concept</option>
                  <option value="overview">Overview</option>
                  <option value="summary">Summary</option>
                  <option value="entity">Entity</option>
                  <option value="query-answer">Query answer</option>
                </select>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Latest changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {loaderData.latestChanges.map((page) => (
                <div
                  key={page.slug}
                  className="rounded-2xl bg-secondary/45 px-4 py-3"
                >
                  <p className="font-semibold text-foreground">{page.title}</p>
                  <p>{page.summaryLine}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
