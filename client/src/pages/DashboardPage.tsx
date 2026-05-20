import { Form, Link, useActionData, useLoaderData } from 'react-router';
import { ArrowRight, FilePlus2, Play, ScanSearch } from 'lucide-react';
import {
  ActionBanner,
  InsightStrip,
  MetricCard,
  PageHeader,
  TimelineMini,
  WikiPageCard,
} from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';
import {
  getStarterPrompts,
  getWikiPage,
  getWorkspaceSummary,
} from '@/lib/mock-data';

export async function loader() {
  return requireAuthenticatedLoader({
    highlightedPages: ['knowledge-compilers', 'review-workflow']
      .map((slug) => getWikiPage(slug))
      .filter((page) => page !== null),
    starterPrompts: getStarterPrompts(),
    ...getWorkspaceSummary(),
  });
}

export const action = createPlaceholderAction('start-ingest');

export default function DashboardPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionMessage = actionData
    ? `Captured ${actionData.intent} with mode ${actionData.fields.mode ?? 'single'} at ${new Date(actionData.submittedAt).toLocaleTimeString()}.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link
                to="/queries"
                state={{ prompt: loaderData.starterPrompts[0] }}
              >
                Resume draft query
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild>
              <Link to="/sources">
                Open source desk
                <FilePlus2 className="size-4" />
              </Link>
            </Button>
          </>
        }
        description="Monitor recent ingest, lint, and query work from a parchment-toned command desk with the wiki’s health visible at a glance."
        eyebrow="Dashboard"
        title={loaderData.workspaceName}
      />

      <ActionBanner message={actionMessage} />
      <InsightStrip />

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          detail="Immutable records ready for review or ingest."
          label="Raw Sources"
          value={loaderData.sourceCount}
        />
        <MetricCard
          detail="Persistent markdown pages currently in the wiki."
          label="Wiki Pages"
          value={loaderData.pageCount}
        />
        <MetricCard
          detail="Open quality issue requiring editorial attention."
          label="Contradictions"
          value={loaderData.contradictionCount}
        />
        <MetricCard
          detail="Pages that need more inbound links."
          label="Orphan Pages"
          value={loaderData.orphanPageCount}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Recent log.md activity</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineMini entries={loaderData.recentLogEntries} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {loaderData.highlightedPages.map((page) =>
              page ? <WikiPageCard key={page.slug} page={page} /> : null,
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form className="space-y-3" method="post">
                <input name="intent" type="hidden" value="start-ingest" />
                <input name="mode" type="hidden" value="single" />
                <Button className="w-full justify-between" type="submit">
                  Start ingest review
                  <Play className="size-4" />
                </Button>
              </Form>
              <Form className="space-y-3" method="post">
                <input name="intent" type="hidden" value="start-lint" />
                <input name="mode" type="hidden" value="full" />
                <Button
                  className="w-full justify-between"
                  type="submit"
                  variant="outline"
                >
                  Run workspace lint
                  <ScanSearch className="size-4" />
                </Button>
              </Form>
              <p className="text-sm leading-6 text-muted-foreground">
                Current ingest mode:{' '}
                <span className="font-semibold text-foreground">
                  {loaderData.currentIngestMode}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Job status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loaderData.queuedJobs.map((job) => (
                <div
                  key={job.id}
                  className="space-y-2 rounded-3xl border border-border/70 bg-secondary/35 p-4"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">
                      {job.label}
                    </span>
                    <span className="text-muted-foreground">{job.status}</span>
                  </div>
                  <div className="h-2 rounded-full bg-background">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.round(job.progress * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
