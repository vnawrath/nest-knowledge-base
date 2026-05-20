import { Form, Link, useActionData, useLoaderData } from 'react-router';
import {
  ActionBanner,
  PageHeader,
  PillLinks,
  SourceCard,
  WikiPageCard,
} from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
  notFoundResponse,
} from '../session';
import { getSource, getWikiPage } from '@/lib/mock-data';

export async function loader({ params }: { params: { sourceId?: string } }) {
  const source = params.sourceId ? getSource(params.sourceId) : null;
  if (!source) {
    throw notFoundResponse('Source');
  }

  return requireAuthenticatedLoader({
    attachmentsPath: 'raw/assets/',
    linkedWikiPages: source.linkedPageSlugs
      .map((slug) => getWikiPage(slug))
      .filter((page) => page !== null),
    source,
  });
}

export const action = createPlaceholderAction('trigger-ingest');

export default function SourceDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionMessage = actionData
    ? `Recorded ${actionData.intent} for ${loaderData.source.title}.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        actions={
          <Button asChild>
            <Link to={`/sources/${loaderData.source.id}/ingest`}>
              Open ingest review
            </Link>
          </Button>
        }
        description="Inspect immutable source material, downloaded attachments, and the wiki pages already linked to this record."
        eyebrow="Raw Source Detail"
        title={loaderData.source.title}
      />

      <ActionBanner message={actionMessage} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <SourceCard source={loaderData.source} />
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Extracted preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-foreground/85">
              <p>{loaderData.source.excerpt}</p>
              <p className="rounded-3xl border border-border/70 bg-secondary/35 p-4 text-muted-foreground">
                Attachments should be reviewed beside the note itself. The
                workspace expects locally downloaded files under{' '}
                <code>raw/assets/</code>.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Reviewer notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Form className="space-y-4" method="post">
                <input name="intent" type="hidden" value="rename-source" />
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">
                    Display title
                  </span>
                  <input
                    className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm"
                    defaultValue={loaderData.source.title}
                    name="title"
                  />
                </label>
                <Button type="submit" variant="outline">
                  Save note
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Linked wiki pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loaderData.linkedWikiPages.map((page) =>
                page ? <WikiPageCard key={page.slug} page={page} /> : null,
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Attachments and run history
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              {loaderData.source.attachments.length ? (
                <ul className="space-y-3">
                  {loaderData.source.attachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className="rounded-2xl bg-secondary/45 px-4 py-3"
                    >
                      <p className="font-semibold text-foreground">
                        {attachment.label}
                      </p>
                      <p>{attachment.note}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No local attachments stored for this source yet.</p>
              )}
              <PillLinks
                items={loaderData.source.linkedPageSlugs}
                to={(slug) => `/wiki/${slug}`}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
