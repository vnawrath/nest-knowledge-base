import { Form, useActionData, useLoaderData } from 'react-router';
import {
  ActionBanner,
  LintFindingCard,
  PageHeader,
} from '@/components/workspace-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';
import { getLintSnapshot } from '@/lib/mock-data';

export async function loader() {
  return requireAuthenticatedLoader(getLintSnapshot());
}

export const action = createPlaceholderAction('run-lint');

export default function LintPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const grouped = loaderData.findings.reduce<
    Record<string, typeof loaderData.findings>
  >((accumulator, finding) => {
    accumulator[finding.findingType] ??= [];
    accumulator[finding.findingType].push(finding);
    return accumulator;
  }, {});
  const actionMessage = actionData
    ? `Queued ${actionData.intent} for a fresh workspace sweep.`
    : undefined;

  return (
    <main className="space-y-6">
      <PageHeader
        description={loaderData.summary}
        eyebrow="Lint"
        title="Wiki Health Triage"
      />
      <ActionBanner message={actionMessage} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, findings]) => (
            <section key={group} className="space-y-4">
              <h2 className="inked-title text-3xl">{group}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {findings.map((finding) => (
                  <LintFindingCard key={finding.id} finding={finding} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Run lint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Last run: {new Date(loaderData.lastRun).toLocaleString()}
              </p>
              <Form method="post">
                <input name="intent" type="hidden" value="run-lint" />
                <input name="findingType" type="hidden" value="all" />
                <Button className="w-full" type="submit">
                  Run full lint
                </Button>
              </Form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Finding mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {Object.entries(grouped).map(([group, findings]) => (
                <div
                  key={group}
                  className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3"
                >
                  <span>{group}</span>
                  <span>{findings.length}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
