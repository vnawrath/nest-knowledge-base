import { Form, useActionData, useLoaderData } from 'react-router';
import {
  ActionBanner,
  MarkdownSheet,
  PageHeader,
  PillLinks,
} from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
  notFoundResponse,
} from '../session';
import { getQuery } from '@/lib/mock-data';

export async function loader({ params }: { params: { queryId?: string } }) {
  const query = params.queryId ? getQuery(params.queryId) : null;
  if (!query) {
    throw notFoundResponse('Query');
  }

  return requireAuthenticatedLoader({
    query,
  });
}

export const action = createPlaceholderAction('rerun-query');

export default function QueryDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionMessage = actionData
    ? `Captured ${actionData.intent} for query ${loaderData.query.id}.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        description={loaderData.query.summary}
        eyebrow="Saved Query Detail"
        title={loaderData.query.prompt}
      />
      <ActionBanner message={actionMessage} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <MarkdownSheet
            markdown={loaderData.query.answerMarkdown}
            title="Rendered answer"
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Answer actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Form method="post">
                <input name="intent" type="hidden" value="rerun-query" />
                <input
                  name="format"
                  type="hidden"
                  value={loaderData.query.answerFormat}
                />
                <Button type="submit">Rerun query</Button>
              </Form>
              <Form method="post">
                <input name="intent" type="hidden" value="save-as-wiki-page" />
                <input
                  name="format"
                  type="hidden"
                  value={loaderData.query.answerFormat}
                />
                <Button type="submit" variant="outline">
                  Save as wiki page
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Cited pages</CardTitle>
            </CardHeader>
            <CardContent>
              <PillLinks
                items={loaderData.query.citedPageSlugs}
                to={(slug) => `/wiki/${slug}`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Persistence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Answer format: {loaderData.query.answerFormat}</p>
              <p>
                Saved wiki page:{' '}
                {loaderData.query.savedWikiPageSlug ?? 'Not yet persisted'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
