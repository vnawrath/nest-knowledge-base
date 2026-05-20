import { Form, useActionData, useLoaderData } from 'react-router';
import {
  ActionBanner,
  LintFindingCard,
  MarkdownSheet,
  PageHeader,
  WikiPageCard,
} from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
  notFoundResponse,
} from '../session';
import { getIngestReview } from '@/lib/mock-data';

export async function loader({ params }: { params: { sourceId?: string } }) {
  const review = params.sourceId ? getIngestReview(params.sourceId) : null;
  if (!review) {
    throw notFoundResponse('Source');
  }

  return requireAuthenticatedLoader({
    ...review,
  });
}

export const action = createPlaceholderAction('run-ingest');

export default function IngestReviewPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionMessage = actionData
    ? `Prepared ${actionData.intent} for ${loaderData.source.title}.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        description="Compare raw material, extracted takeaways, and affected wiki pages side-by-side before writing anything back into the workspace."
        eyebrow="Ingest Review"
        title={loaderData.source.title}
      />

      <ActionBanner message={actionMessage} />

      <div className="grid gap-6 2xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Raw source readout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>{loaderData.source.excerpt}</p>
            <p className="rounded-3xl border border-border/70 bg-secondary/35 p-4 text-foreground/85">
              {loaderData.source.notes}
            </p>
            <Form className="space-y-3" method="post">
              <input name="intent" type="hidden" value="save-draft" />
              <input name="decision" type="hidden" value="save partial draft" />
              <Button type="submit" variant="outline">
                Save partial draft
              </Button>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Suggested takeaways</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {loaderData.suggestedTakeaways.map((takeaway) => (
                  <li
                    key={takeaway}
                    className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm leading-6 text-foreground/85"
                  >
                    {takeaway}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <MarkdownSheet
            markdown={loaderData.draftSummaryMarkdown}
            title="Draft summary markdown"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Impacted wiki pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loaderData.impactedPages.map((page) => (
                <WikiPageCard key={page.slug} page={page} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Approve and run</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form className="space-y-3" method="post">
                <input name="intent" type="hidden" value="run-ingest" />
                <input name="decision" type="hidden" value="approve summary" />
                <Button className="w-full" type="submit">
                  Approve summary and ingest
                </Button>
              </Form>
              {loaderData.contradictionWarnings.map((finding) => (
                <LintFindingCard key={finding.id} finding={finding} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
