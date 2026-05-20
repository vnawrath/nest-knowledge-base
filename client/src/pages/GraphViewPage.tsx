import { Form, useLoaderData } from 'react-router';
import {
  GraphConstellation,
  PageHeader,
  PillLinks,
} from '@/components/workspace-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGraphSnapshot } from '@/lib/mock-data';
import { requireAuthenticatedLoader } from '../session';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? 'all';

  return requireAuthenticatedLoader({
    category,
    ...getGraphSnapshot(category),
  });
}
export const action = undefined;

export default function GraphViewPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main className="space-y-6">
      <PageHeader
        description="Graph mode is a first-class reading surface, making link density, hub pages, and contradictions immediately visible."
        eyebrow="Graph View"
        title="Knowledge Topology"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <GraphConstellation
            links={loaderData.links}
            nodes={loaderData.nodes}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Graph filters</CardTitle>
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
              <CardTitle className="text-2xl">Hub pages</CardTitle>
            </CardHeader>
            <CardContent>
              <PillLinks
                items={loaderData.hubPages.map((page) => page.slug)}
                to={(slug) => `/wiki/${slug}`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Orphan pages</CardTitle>
            </CardHeader>
            <CardContent>
              <PillLinks
                items={loaderData.orphanPages.map((page) => page.slug)}
                to={(slug) => `/wiki/${slug}`}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
