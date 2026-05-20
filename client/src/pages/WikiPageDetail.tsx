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
import { getSource, getWikiPage } from '@/lib/mock-data';

export async function loader({ params }: { params: { slug?: string } }) {
  const page = params.slug ? getWikiPage(params.slug) : null;
  if (!page) {
    throw notFoundResponse('Wiki page');
  }

  return requireAuthenticatedLoader({
    linkedSources: page.linkedSourceIds
      .map((id) => getSource(id))
      .filter((source) => source !== null),
    page,
    relatedPages: page.outboundLinks
      .map((slug) => getWikiPage(slug))
      .filter((relatedPage) => relatedPage !== null),
  });
}

export const action = createPlaceholderAction('request-llm-refresh');

export default function WikiPageDetail() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionMessage = actionData
    ? `Stored ${actionData.intent} for ${loaderData.page.title}.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        description={loaderData.page.summaryLine}
        eyebrow="Wiki Page"
        title={loaderData.page.title}
      />

      <ActionBanner message={actionMessage} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Frontmatter and summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                {loaderData.page.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p>Source count: {loaderData.page.sourceCount}</p>
              <p>Backlinks: {loaderData.page.backlinks.length}</p>
            </CardContent>
          </Card>

          <MarkdownSheet
            markdown={loaderData.page.markdown}
            title={loaderData.page.title}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Page actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Form className="space-y-3" method="post">
                <input
                  name="intent"
                  type="hidden"
                  value="request-llm-refresh"
                />
                <input
                  name="title"
                  type="hidden"
                  value={loaderData.page.title}
                />
                <Button type="submit">Request LLM refresh</Button>
              </Form>
              <Form className="space-y-3" method="post">
                <input name="intent" type="hidden" value="save-manual-note" />
                <input
                  name="title"
                  type="hidden"
                  value={`${loaderData.page.title} note`}
                />
                <Button type="submit" variant="outline">
                  Save manual note
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Link map</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="mb-3 font-semibold text-foreground">Backlinks</p>
                <PillLinks
                  items={loaderData.page.backlinks}
                  to={(slug) => `/wiki/${slug}`}
                />
              </div>
              <div>
                <p className="mb-3 font-semibold text-foreground">
                  Outbound links
                </p>
                <PillLinks
                  items={loaderData.page.outboundLinks}
                  to={(slug) => `/wiki/${slug}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Linked raw sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {loaderData.linkedSources.map((source) =>
                source ? (
                  <div
                    key={source.id}
                    className="rounded-2xl bg-secondary/45 px-4 py-3"
                  >
                    <p className="font-semibold text-foreground">
                      {source.title}
                    </p>
                    <p>{source.summary}</p>
                  </div>
                ) : null,
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Git history summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {loaderData.page.gitHistory.map((entry) => (
                <div
                  key={entry.commit}
                  className="rounded-2xl bg-secondary/45 px-4 py-3"
                >
                  <p className="font-mono text-xs text-muted-foreground">
                    {entry.commit}
                  </p>
                  <p className="font-semibold text-foreground">
                    {entry.summary}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
